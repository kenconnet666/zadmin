import { SvelteMap } from 'svelte/reactivity';
import { tabbable } from 'tabbable';

import { containsComposedNode, getActiveElement } from '../layer/dom-realm.js';
import {
	fieldPathKey,
	fieldPathToString,
	fieldPathStartsWith,
	normalizeFieldPath,
	type FieldPath,
	type FieldPathInput
} from './field-path.js';
import {
	remapFormListErrors,
	remapFormListPath,
	type FormListReconcile
} from './form-list-reconcile.js';
import { errorsForPaths, mergeErrorsForPaths, type FormErrors } from './validation.js';

export interface FormFieldState {
	readonly dirty: boolean;
	readonly errors: readonly string[];
	readonly success?: string;
	readonly touched: boolean;
	readonly validating: boolean;
	readonly warnings: readonly string[];
}

export type FormFieldStatePatch = Partial<Pick<FormFieldState, 'errors' | 'success' | 'warnings'>>;

/** Observes committed field-state transitions; it never owns or exposes field values. */
export type FormFieldStateListener = (state: FormFieldState) => void;

export interface FormFieldRegistration {
	readonly control: () => HTMLElement | null;
	readonly dependencies?: readonly FieldPathInput[];
	readonly htmlName: string;
	readonly htmlNameFollowsPath?: boolean;
	readonly instanceId: string;
	readonly path: FieldPathInput;
	readonly preserve?: boolean;
}

export interface FormValidationTicket {
	readonly entries: readonly {
		readonly key: string;
		readonly path: FieldPath;
		readonly version: number;
	}[];
}

/** @internal A validated registry snapshot that can be committed synchronously. */
export interface FormRegistryPreparedListMutation {
	commit(): void;
}

interface RegisteredField {
	readonly control: () => HTMLElement | null;
	readonly dependencies: readonly FieldPath[];
	readonly dependencyKeys: ReadonlySet<string>;
	readonly htmlName: string;
	readonly htmlNameFollowsPath: boolean;
	readonly instanceId: string;
	readonly key: string;
	readonly order: number;
	readonly path: FieldPath;
	readonly preserve: boolean;
	readonly registrationToken: symbol;
}

const INITIAL_STATE = Object.freeze({
	dirty: false,
	errors: Object.freeze([]),
	success: undefined,
	touched: false,
	validating: false,
	warnings: Object.freeze([])
}) satisfies FormFieldState;

function freezeState(state: FormFieldState): FormFieldState {
	return Object.freeze({
		...state,
		errors: Object.freeze([...state.errors]),
		warnings: Object.freeze([...state.warnings])
	});
}

function fieldErrorMessages(errors: FormErrors, path: FieldPath): readonly string[] {
	return Object.freeze([...new Set(Object.values(errorsForPaths(errors, [path])).flat())]);
}

function sameFieldState(left: FormFieldState, right: FormFieldState): boolean {
	return (
		left.dirty === right.dirty &&
		left.touched === right.touched &&
		left.validating === right.validating &&
		left.success === right.success &&
		left.errors.length === right.errors.length &&
		left.errors.every((error, index) => error === right.errors[index]) &&
		left.warnings.length === right.warnings.length &&
		left.warnings.every((warning, index) => warning === right.warnings[index])
	);
}

function compareDocumentOrder(left: HTMLElement, right: HTMLElement): number {
	if (left === right || left.ownerDocument !== right.ownerDocument) return 0;
	const position = left.compareDocumentPosition(right);
	const node = left.ownerDocument.defaultView?.Node;
	const following = node?.DOCUMENT_POSITION_FOLLOWING ?? 4;
	const preceding = node?.DOCUMENT_POSITION_PRECEDING ?? 2;
	if (position & following) return -1;
	if (position & preceding) return 1;
	return 0;
}

export class FormRegistry {
	// Registration and DOM nodes are imperative metadata; #states is the reactive public surface.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	readonly #fields = new Map<string, RegisteredField>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	readonly #pathInstances = new Map<string, Set<string>>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	readonly #paths = new Map<string, FieldPath>();
	// Preserved unmounted state remains addressable for list remap and explicit removal.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	readonly #retainedPaths = new Map<string, FieldPath>();
	readonly #states = new SvelteMap<string, FormFieldState>();
	// Subscribers observe immutable state snapshots; the registry remains the only state owner.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	readonly #listeners = new Map<string, Set<FormFieldStateListener>>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	readonly #validationVersions = new Map<string, number>();
	readonly #validationScopes = new Map<string, FieldPath>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	readonly #unmountVersions = new Map<string, number>();
	readonly #onPathUnmount?: (path: FieldPath, preserve: boolean) => void;
	readonly #onMembershipChange?: (field: FormFieldRegistration) => void;
	#errors: FormErrors = Object.freeze({});
	#order = 0;
	#batchDepth = 0;
	readonly #pendingNotifications = new Map<string, FormFieldState>();
	batch(update: () => void): void {
		this.#batchDepth += 1;
		try {
			update();
		} finally {
			this.#batchDepth -= 1;
			if (this.#batchDepth === 0) {
				const pending = [...this.#pendingNotifications];
				this.#pendingNotifications.clear();
				for (const [key, state] of pending) this.#notify(key, state);
			}
		}
	}

	constructor(
		onPathUnmount?: (path: FieldPath, preserve: boolean) => void,
		onMembershipChange?: (field: FormFieldRegistration) => void
	) {
		this.#onPathUnmount = onPathUnmount;
		this.#onMembershipChange = onMembershipChange;
	}

	register(registration: FormFieldRegistration): () => void {
		const path = normalizeFieldPath(registration.path);
		const key = fieldPathKey(path);
		if (registration.htmlName.length === 0) {
			throw new TypeError('ZFormField htmlName must not be empty.');
		}
		if (this.#fields.has(registration.instanceId)) {
			throw new Error(`Duplicate ZFormField instance "${registration.instanceId}".`);
		}
		for (const field of this.#fields.values()) {
			if (field.key === key && field.htmlName !== registration.htmlName) {
				throw new Error(
					`ZFormField path "${fieldPathToString(path)}" must use one shared HTML name.`
				);
			}
			if (
				field.key !== key &&
				(fieldPathStartsWith(path, field.path) || fieldPathStartsWith(field.path, path))
			) {
				throw new Error(
					`Conflicting ZForm FieldPaths "${fieldPathToString(field.path)}" and "${fieldPathToString(path)}".`
				);
			}
			if (field.htmlName === registration.htmlName && field.key !== key) {
				throw new Error(
					`ZFormField HTML name "${registration.htmlName}" cannot represent multiple FieldPaths.`
				);
			}
		}
		// Field dependencies are registration metadata; #states publishes reactive changes.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const dependencies = Object.freeze((registration.dependencies ?? []).map(normalizeFieldPath));
		const dependencyKeys = new Set(dependencies.map(fieldPathKey));
		const preserve = registration.preserve ?? false;
		for (const instanceId of this.#pathInstances.get(key) ?? []) {
			if (this.#fields.get(instanceId)?.preserve !== preserve)
				throw new Error('ZFormField instances sharing one path must use one preserve policy.');
		}
		const field = {
			control: registration.control,
			dependencies,
			dependencyKeys,
			htmlName: registration.htmlName,
			htmlNameFollowsPath: registration.htmlNameFollowsPath ?? false,
			instanceId: registration.instanceId,
			key,
			order: (this.#order += 1),
			path,
			preserve,
			registrationToken: Symbol()
		} satisfies RegisteredField;
		this.#fields.set(field.instanceId, field);
		this.#paths.set(key, path);
		this.#retainedPaths.delete(key);
		// Instance membership is imperative registration bookkeeping.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const instances = this.#pathInstances.get(key) ?? new Set<string>();
		this.#unmountVersions.set(key, (this.#unmountVersions.get(key) ?? 0) + 1);
		instances.add(field.instanceId);
		this.#pathInstances.set(key, instances);
		if (!this.#states.has(key)) {
			this.#states.set(
				key,
				freezeState({
					...INITIAL_STATE,
					errors: fieldErrorMessages(this.#errors, path)
				})
			);
		} else this.#patch(key, { errors: fieldErrorMessages(this.#errors, path) });
		this.#onMembershipChange?.(field);
		return () => {
			const current = this.#fields.get(field.instanceId);
			if (current?.registrationToken !== field.registrationToken) return;
			this.#fields.delete(field.instanceId);
			const currentInstances = this.#pathInstances.get(current.key);
			currentInstances?.delete(field.instanceId);
			if ((currentInstances?.size ?? 0) > 0) {
				const remaining = this.#fields.get(currentInstances!.values().next().value!);
				if (remaining) this.#onMembershipChange?.(remaining);
				return;
			}
			const unmountVersion = (this.#unmountVersions.get(current.key) ?? 0) + 1;
			this.#unmountVersions.set(current.key, unmountVersion);
			queueMicrotask(() => {
				if (
					this.#unmountVersions.get(current.key) !== unmountVersion ||
					(this.#pathInstances.get(current.key)?.size ?? 0) > 0
				) {
					return;
				}
				this.#pathInstances.delete(current.key);
				this.#paths.delete(current.key);
				if (!current.preserve) {
					this.#states.delete(current.key);
					this.#listeners.delete(current.key);
					this.#retainedPaths.delete(current.key);
				} else this.#retainedPaths.set(current.key, current.path);
				this.#validationVersions.set(
					current.key,
					(this.#validationVersions.get(current.key) ?? 0) + 1
				);
				this.#onPathUnmount?.(current.path, current.preserve);
			});
		};
	}

	state(path: FieldPathInput): FormFieldState {
		return this.#states.get(fieldPathKey(path)) ?? INITIAL_STATE;
	}

	/**
	 * Subscribes to future state transitions for a field path. There is deliberately no initial
	 * emission: callers can synchronously read `state(path)` for the current snapshot. A listener
	 * is removed automatically when the path has no registered instances left; no synthetic
	 * unmounted state is emitted. The returned unsubscribe is idempotent, and listener exceptions
	 * never abort a registry mutation or notification of other listeners.
	 */
	subscribeField(path: FieldPathInput, listener: FormFieldStateListener): () => void {
		if (typeof listener !== 'function')
			throw new TypeError('Form field listener must be a function.');
		const key = fieldPathKey(path);
		// Listener membership is imperative lifecycle state and never drives rendering.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const listeners = this.#listeners.get(key) ?? new Set<FormFieldStateListener>();
		listeners.add(listener);
		this.#listeners.set(key, listeners);
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			const current = this.#listeners.get(key);
			if (!current) return;
			current.delete(listener);
			if (current.size === 0) this.#listeners.delete(key);
		};
	}

	registeredPaths(): readonly FieldPath[] {
		return Object.freeze([...this.#paths.values()]);
	}
	registeredInstances(): readonly string[] {
		return Object.freeze([...this.#fields.keys()]);
	}
	summary(): { readonly dirty: boolean; readonly touched: boolean } {
		const states = [...this.#states.values()];
		return Object.freeze({
			dirty: states.some((state) => state.dirty),
			touched: states.some((state) => state.touched)
		});
	}

	formDataPaths(): ReadonlyMap<string, FieldPath> {
		// Callers receive a fresh read-only snapshot, not a reactive registry.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const result = new Map<string, FieldPath>();
		for (const field of this.#fields.values()) result.set(field.htmlName, field.path);
		return result;
	}

	affectedPaths(instanceId: string): readonly FieldPath[] {
		const source = this.#fields.get(instanceId);
		if (!source) return [];
		// Graph traversal membership is local to this query.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const affected = new Set([source.key]);
		const pending = [source.key];
		while (pending.length > 0) {
			const dependencyKey = pending.shift()!;
			for (const field of this.#fields.values()) {
				if (affected.has(field.key) || !field.dependencyKeys.has(dependencyKey)) continue;
				affected.add(field.key);
				pending.push(field.key);
			}
		}
		return Object.freeze([...affected].map((key) => this.#paths.get(key)!).filter(Boolean));
	}

	markDirty(instanceId: string): void {
		const field = this.#fields.get(instanceId);
		if (field) this.#patch(field.key, { dirty: true });
	}
	/** Model updates can address several paths without a native input event. */
	affectedPathsFor(paths: readonly FieldPath[]): readonly FieldPath[] {
		const affected = new Map<string, FieldPath>();
		for (const field of this.#fields.values()) {
			if (
				!paths.some(
					(path) => fieldPathStartsWith(path, field.path) || fieldPathStartsWith(field.path, path)
				)
			)
				continue;
			for (const path of this.affectedPaths(field.instanceId))
				affected.set(fieldPathKey(path), path);
		}
		return Object.freeze([...affected.values()]);
	}

	fieldInfo(instanceId: string): Pick<RegisteredField, 'path' | 'htmlName'> | undefined {
		return this.#fields.get(instanceId);
	}

	setDirty(path: FieldPathInput, dirty: boolean): void {
		const key = fieldPathKey(path);
		if (this.#states.has(key)) this.#patch(key, { dirty });
	}

	markTouched(instanceId: string): void {
		const field = this.#fields.get(instanceId);
		if (field) this.#patch(field.key, { touched: true });
	}

	markAllTouched(): void {
		for (const key of this.#paths.keys()) this.#patch(key, { touched: true });
	}

	setFieldState(path: FieldPathInput, patch: FormFieldStatePatch): void {
		const normalized: { -readonly [TKey in keyof FormFieldState]?: FormFieldState[TKey] } = {};
		if (patch.errors !== undefined) normalized.errors = Object.freeze([...patch.errors]);
		if (patch.warnings !== undefined) normalized.warnings = Object.freeze([...patch.warnings]);
		if ('success' in patch) normalized.success = patch.success;
		this.#patch(fieldPathKey(path), normalized);
	}

	syncErrors(errors: FormErrors): void {
		this.#errors = errors;
		for (const [key, path] of this.#paths) {
			const fieldErrors = fieldErrorMessages(errors, path);
			this.#patch(key, {
				errors: fieldErrors,
				...(fieldErrors.length > 0 ? { success: undefined } : {})
			});
		}
	}

	beginValidation(paths: readonly FieldPath[]): FormValidationTicket {
		const requested = new Map(paths.map((path) => [fieldPathKey(path), path]));
		for (const path of this.#paths.values()) {
			if (
				paths.some((scope) => fieldPathStartsWith(path, scope) || fieldPathStartsWith(scope, path))
			)
				requested.set(fieldPathKey(path), path);
		}
		for (const [key, scope] of this.#validationScopes) {
			if (
				paths.some((path) => fieldPathStartsWith(path, scope) || fieldPathStartsWith(scope, path))
			)
				this.#validationVersions.set(key, (this.#validationVersions.get(key) ?? 0) + 1);
		}
		const entries = [...requested.values()].map((path) => {
			const key = fieldPathKey(path);
			this.#validationScopes.set(key, path);
			const version = (this.#validationVersions.get(key) ?? 0) + 1;
			this.#validationVersions.set(key, version);
			if (this.#states.has(key)) this.#patch(key, { validating: true });
			return Object.freeze({ key, path, version });
		});
		return Object.freeze({ entries: Object.freeze(entries) });
	}

	finishValidation(
		ticket: FormValidationTicket,
		errors: FormErrors,
		options: { readonly publishErrors?: boolean } = {}
	): readonly FieldPath[] {
		const accepted: FieldPath[] = [];
		for (const entry of ticket.entries) {
			if (this.#validationVersions.get(entry.key) !== entry.version) continue;
			accepted.push(entry.path);
			if (!this.#states.has(entry.key)) continue;
			if (options.publishErrors === false) {
				this.#patch(entry.key, { validating: false });
				continue;
			}
			const fieldErrors = fieldErrorMessages(errors, entry.path);
			this.#patch(entry.key, {
				errors: fieldErrors,
				...(fieldErrors.length > 0 ? { success: undefined } : {}),
				validating: false
			});
		}
		return Object.freeze(accepted);
	}

	cancelValidation(): void {
		for (const key of this.#validationScopes.keys())
			this.#validationVersions.set(key, (this.#validationVersions.get(key) ?? 0) + 1);
		for (const key of this.#paths.keys()) {
			this.#validationVersions.set(key, (this.#validationVersions.get(key) ?? 0) + 1);
			this.#patch(key, { validating: false });
		}
	}

	reset(): void {
		this.cancelValidation();
		this.#errors = Object.freeze({});
		for (const key of this.#states.keys()) this.#setState(key, INITIAL_STATE);
	}
	resetField(path: FieldPathInput): void {
		const scope = normalizeFieldPath(path);
		for (const [key, active] of this.#validationScopes) {
			if (fieldPathStartsWith(active, scope) || fieldPathStartsWith(scope, active))
				this.#validationVersions.set(key, (this.#validationVersions.get(key) ?? 0) + 1);
		}
		this.#errors = mergeErrorsForPaths(this.#errors, {}, [scope]);
		this.batch(() => {
			for (const [key, registered] of new Map([...this.#retainedPaths, ...this.#paths]))
				if (fieldPathStartsWith(registered, scope)) this.#setState(key, INITIAL_STATE);
		});
	}

	prepareList(change: FormListReconcile): FormRegistryPreparedListMutation {
		const previousPaths = new Map([...this.#retainedPaths, ...this.#paths]);
		const nextFields = new Map<string, RegisteredField>();
		for (const field of this.#fields.values()) {
			const path = remapFormListPath(field.path, change);
			if (!path) continue;
			const dependencies = Object.freeze(
				field.dependencies
					.map((dependency) => remapFormListPath(dependency, change))
					.filter((dependency): dependency is FieldPath => dependency !== undefined)
			);
			nextFields.set(field.instanceId, {
				...field,
				dependencies,
				dependencyKeys: new Set(dependencies.map(fieldPathKey)),
				htmlName: field.htmlNameFollowsPath ? fieldPathToString(path) : field.htmlName,
				key: fieldPathKey(path),
				path
			});
		}
		const candidates = [...nextFields.values()];
		for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
			const left = candidates[leftIndex]!;
			for (let rightIndex = leftIndex + 1; rightIndex < candidates.length; rightIndex += 1) {
				const right = candidates[rightIndex]!;
				if (left.key === right.key && left.htmlName !== right.htmlName)
					throw new Error(
						`ZFormField path "${fieldPathToString(left.path)}" must use one shared HTML name.`
					);
				if (
					left.key !== right.key &&
					(fieldPathStartsWith(left.path, right.path) || fieldPathStartsWith(right.path, left.path))
				)
					throw new Error(
						`Conflicting ZForm FieldPaths "${fieldPathToString(left.path)}" and "${fieldPathToString(right.path)}".`
					);
				if (left.htmlName === right.htmlName && left.key !== right.key)
					throw new Error(
						`ZFormField HTML name "${left.htmlName}" cannot represent multiple FieldPaths.`
					);
				if (left.key === right.key && left.preserve !== right.preserve)
					throw new Error('ZFormField instances sharing one path must use one preserve policy.');
			}
		}
		const nextErrors = remapFormListErrors(this.#errors, change);
		const nextInstances = new Map<string, Set<string>>();
		const nextPaths = new Map<string, FieldPath>();
		for (const field of nextFields.values()) {
			const instances = nextInstances.get(field.key) ?? new Set<string>();
			instances.add(field.instanceId);
			nextInstances.set(field.key, instances);
			nextPaths.set(field.key, field.path);
		}
		const affectedKeys = new Set<string>();
		const movedStates = new Map<string, FormFieldState>();
		for (const [key, path] of previousPaths) {
			const remapped = remapFormListPath(path, change);
			if (fieldPathStartsWith(path, change.listPath)) affectedKeys.add(key);
			if (!remapped) continue;
			const nextKey = fieldPathKey(remapped);
			if (nextKey !== key) affectedKeys.add(nextKey);
			const state = this.#states.get(key);
			if (state) {
				if (state.validating) affectedKeys.add(key);
				movedStates.set(
					nextKey,
					state.validating ? freezeState({ ...state, validating: false }) : state
				);
			}
		}
		const nextRetainedPaths = new Map<string, FieldPath>();
		for (const path of this.#retainedPaths.values()) {
			const remapped = remapFormListPath(path, change);
			if (remapped) nextRetainedPaths.set(fieldPathKey(remapped), remapped);
		}
		const nextValidationVersions = new Map(this.#validationVersions);
		for (const key of this.#validationScopes.keys())
			nextValidationVersions.set(key, (nextValidationVersions.get(key) ?? 0) + 1);
		for (const key of this.#paths.keys())
			nextValidationVersions.set(key, (nextValidationVersions.get(key) ?? 0) + 1);
		const nextUnmountVersions = new Map(this.#unmountVersions);
		for (const key of affectedKeys)
			nextUnmountVersions.set(key, (nextUnmountVersions.get(key) ?? 0) + 1);
		let committed = false;
		return {
			commit: () => {
				if (committed) return;
				committed = true;
				this.batch(() => {
					for (const key of affectedKeys) this.#states.delete(key);
					for (const [key, state] of movedStates) this.#states.set(key, state);
					for (const key of affectedKeys) if (!nextPaths.has(key)) this.#listeners.delete(key);
					this.#fields.clear();
					for (const [instanceId, field] of nextFields) this.#fields.set(instanceId, field);
					this.#pathInstances.clear();
					for (const [key, instances] of nextInstances) this.#pathInstances.set(key, instances);
					this.#paths.clear();
					for (const [key, path] of nextPaths) this.#paths.set(key, path);
					this.#retainedPaths.clear();
					for (const [key, path] of nextRetainedPaths) this.#retainedPaths.set(key, path);
					this.#validationVersions.clear();
					for (const [key, version] of nextValidationVersions)
						this.#validationVersions.set(key, version);
					this.#validationScopes.clear();
					this.#unmountVersions.clear();
					for (const [key, version] of nextUnmountVersions) this.#unmountVersions.set(key, version);
					this.#errors = nextErrors;
					for (const key of affectedKeys)
						this.#pendingNotifications.set(key, this.#states.get(key) ?? INITIAL_STATE);
					for (const field of nextFields.values())
						if (affectedKeys.has(field.key)) this.#onMembershipChange?.(field);
				});
			}
		};
	}

	reconcileList(change: FormListReconcile): void {
		this.prepareList(change).commit();
	}

	listScopeContainsFocus(path: FieldPathInput): boolean {
		const scope = normalizeFieldPath(path);
		return this.#orderedFieldsInScope(scope).some((field) => {
			const control = field.control();
			return Boolean(control && containsComposedNode(control, getActiveElement(control)));
		});
	}

	focusListScope(path: FieldPathInput, options: FocusOptions = { preventScroll: true }): boolean {
		const target = this.#orderedFieldsInScope(normalizeFieldPath(path))[0]?.control();
		return target ? this.#focus(target, options) : false;
	}

	focusField(path: FieldPathInput, options: FocusOptions = { preventScroll: true }): boolean {
		const target = this.#orderedFields(path)[0]?.control();
		return target ? this.#focus(target, options) : false;
	}

	#focus(target: HTMLElement, options: FocusOptions): boolean {
		const candidate =
			(target.ownerDocument?.defaultView
				? tabbable(target, { includeContainer: true })[0]
				: undefined) ??
			target.querySelector<HTMLElement>(
				'input:not([type="hidden"]):not(:disabled), textarea:not(:disabled), select:not(:disabled), button:not(:disabled), [tabindex]:not([tabindex="-1"])'
			) ??
			target;
		candidate.focus(options);
		const ownerDocument = candidate.ownerDocument;
		if (!ownerDocument) return true;
		const active = ownerDocument.activeElement;
		return active === candidate || candidate.contains(active);
	}

	scrollToField(
		path: FieldPathInput,
		options: ScrollIntoViewOptions = { block: 'nearest' }
	): boolean {
		const target = this.#orderedFields(path)[0]?.control();
		if (!target || typeof target.scrollIntoView !== 'function') return false;
		target.scrollIntoView(options);
		return true;
	}

	firstInvalidPath(): FieldPath | undefined {
		for (const field of this.#orderedFields()) {
			if ((this.#states.get(field.key)?.errors.length ?? 0) > 0) return field.path;
		}
		return undefined;
	}

	#orderedFields(path?: FieldPathInput): RegisteredField[] {
		const requested = path === undefined ? undefined : fieldPathKey(path);
		return [...this.#fields.values()]
			.filter((field) => requested === undefined || field.key === requested)
			.sort((left, right) => {
				const leftNode = left.control();
				const rightNode = right.control();
				if (leftNode?.isConnected && rightNode?.isConnected) {
					const documentOrder = compareDocumentOrder(leftNode, rightNode);
					if (documentOrder !== 0) return documentOrder;
				}
				return left.order - right.order;
			});
	}
	#orderedFieldsInScope(scope: FieldPath): RegisteredField[] {
		return [...this.#fields.values()]
			.filter((field) => fieldPathStartsWith(field.path, scope))
			.sort((left, right) => {
				const leftNode = left.control();
				const rightNode = right.control();
				if (leftNode?.isConnected && rightNode?.isConnected) {
					const documentOrder = compareDocumentOrder(leftNode, rightNode);
					if (documentOrder !== 0) return documentOrder;
				}
				return left.order - right.order;
			});
	}

	#patch(key: string, patch: Partial<FormFieldState>): void {
		const current = this.#states.get(key);
		if (current) this.#setState(key, freezeState({ ...current, ...patch }));
	}

	#setState(key: string, next: FormFieldState): void {
		const current = this.#states.get(key);
		if (current && sameFieldState(current, next)) return;
		this.#states.set(key, next);
		if (this.#batchDepth > 0) {
			this.#pendingNotifications.set(key, next);
			return;
		}
		this.#notify(key, next);
	}
	#notify(key: string, next: FormFieldState): void {
		const listeners = this.#listeners.get(key);
		if (!listeners) return;
		for (const listener of [...listeners]) {
			try {
				listener(next);
			} catch {
				// Consumer listeners must not break registry state transitions or sibling listeners.
			}
		}
	}
}
