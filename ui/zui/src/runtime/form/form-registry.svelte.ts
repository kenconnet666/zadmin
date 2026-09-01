import { SvelteMap } from 'svelte/reactivity';
import { tabbable } from 'tabbable';

import {
	fieldPathKey,
	fieldPathToString,
	normalizeFieldPath,
	type FieldPath,
	type FieldPathInput
} from './field-path.js';
import type { FormErrors } from './validation.js';

export interface FormFieldState {
	readonly dirty: boolean;
	readonly errors: readonly string[];
	readonly success?: string;
	readonly touched: boolean;
	readonly validating: boolean;
	readonly warnings: readonly string[];
}

export type FormFieldStatePatch = Partial<Pick<FormFieldState, 'errors' | 'success' | 'warnings'>>;

export interface FormFieldRegistration {
	readonly control: () => HTMLElement | null;
	readonly dependencies?: readonly FieldPathInput[];
	readonly htmlName: string;
	readonly instanceId: string;
	readonly path: FieldPathInput;
}

export interface FormValidationTicket {
	readonly entries: readonly {
		readonly key: string;
		readonly path: FieldPath;
		readonly version: number;
	}[];
}

interface RegisteredField {
	readonly control: () => HTMLElement | null;
	readonly dependencyKeys: ReadonlySet<string>;
	readonly htmlName: string;
	readonly instanceId: string;
	readonly key: string;
	readonly order: number;
	readonly path: FieldPath;
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
	readonly #states = new SvelteMap<string, FormFieldState>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	readonly #validationVersions = new Map<string, number>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	readonly #unmountVersions = new Map<string, number>();
	readonly #onPathUnmount?: (path: FieldPath) => void;
	#errors: FormErrors = Object.freeze({});
	#order = 0;

	constructor(onPathUnmount?: (path: FieldPath) => void) {
		this.#onPathUnmount = onPathUnmount;
	}

	register(registration: FormFieldRegistration): () => void {
		const path = normalizeFieldPath(registration.path);
		const key = fieldPathKey(path);
		if (this.#fields.has(registration.instanceId)) {
			throw new Error(`Duplicate ZFormField instance "${registration.instanceId}".`);
		}
		for (const field of this.#fields.values()) {
			if (field.htmlName === registration.htmlName && field.key !== key) {
				throw new Error(
					`ZFormField HTML name "${registration.htmlName}" cannot represent multiple FieldPaths.`
				);
			}
		}
		const field = {
			control: registration.control,
			dependencyKeys: new Set((registration.dependencies ?? []).map(fieldPathKey)),
			htmlName: registration.htmlName,
			instanceId: registration.instanceId,
			key,
			order: (this.#order += 1),
			path
		} satisfies RegisteredField;
		this.#fields.set(field.instanceId, field);
		this.#paths.set(key, path);
		const instances = this.#pathInstances.get(key) ?? new Set<string>();
		this.#unmountVersions.set(key, (this.#unmountVersions.get(key) ?? 0) + 1);
		instances.add(field.instanceId);
		this.#pathInstances.set(key, instances);
		if (!this.#states.has(key)) {
			this.#states.set(
				key,
				freezeState({
					...INITIAL_STATE,
					errors: this.#errors[fieldPathToString(path)] ?? []
				})
			);
		}
		return () => {
			const current = this.#fields.get(field.instanceId);
			if (current !== field) return;
			this.#fields.delete(field.instanceId);
			const currentInstances = this.#pathInstances.get(key);
			currentInstances?.delete(field.instanceId);
			if ((currentInstances?.size ?? 0) > 0) return;
			const unmountVersion = (this.#unmountVersions.get(key) ?? 0) + 1;
			this.#unmountVersions.set(key, unmountVersion);
			queueMicrotask(() => {
				if (
					this.#unmountVersions.get(key) !== unmountVersion ||
					(this.#pathInstances.get(key)?.size ?? 0) > 0
				) {
					return;
				}
				this.#pathInstances.delete(key);
				this.#paths.delete(key);
				this.#states.delete(key);
				this.#validationVersions.set(key, (this.#validationVersions.get(key) ?? 0) + 1);
				this.#onPathUnmount?.(path);
			});
		};
	}

	state(path: FieldPathInput): FormFieldState {
		return this.#states.get(fieldPathKey(path)) ?? INITIAL_STATE;
	}

	registeredPaths(): readonly FieldPath[] {
		return Object.freeze([...this.#paths.values()]);
	}

	formDataPaths(): ReadonlyMap<string, FieldPath> {
		const result = new Map<string, FieldPath>();
		for (const field of this.#fields.values()) result.set(field.htmlName, field.path);
		return result;
	}

	affectedPaths(instanceId: string): readonly FieldPath[] {
		const source = this.#fields.get(instanceId);
		if (!source) return [];
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

	markTouched(instanceId: string): void {
		const field = this.#fields.get(instanceId);
		if (field) this.#patch(field.key, { touched: true });
	}

	markAllTouched(): void {
		for (const key of this.#paths.keys()) this.#patch(key, { touched: true });
	}

	setFieldState(path: FieldPathInput, patch: FormFieldStatePatch): void {
		const normalized: Partial<FormFieldState> = {};
		if (patch.errors !== undefined) normalized.errors = Object.freeze([...patch.errors]);
		if (patch.warnings !== undefined) normalized.warnings = Object.freeze([...patch.warnings]);
		if ('success' in patch) normalized.success = patch.success;
		this.#patch(fieldPathKey(path), normalized);
	}

	syncErrors(errors: FormErrors): void {
		this.#errors = errors;
		for (const [key, path] of this.#paths) {
			const fieldErrors = Object.freeze([...(errors[fieldPathToString(path)] ?? [])]);
			this.#patch(key, {
				errors: fieldErrors,
				...(fieldErrors.length > 0 ? { success: undefined } : {})
			});
		}
	}

	beginValidation(paths: readonly FieldPath[]): FormValidationTicket {
		const entries = paths.map((path) => {
			const key = fieldPathKey(path);
			const version = (this.#validationVersions.get(key) ?? 0) + 1;
			this.#validationVersions.set(key, version);
			if (this.#states.has(key)) this.#patch(key, { validating: true });
			return Object.freeze({ key, path, version });
		});
		return Object.freeze({ entries: Object.freeze(entries) });
	}

	finishValidation(ticket: FormValidationTicket, errors: FormErrors): readonly FieldPath[] {
		const accepted: FieldPath[] = [];
		for (const entry of ticket.entries) {
			if (this.#validationVersions.get(entry.key) !== entry.version) continue;
			accepted.push(entry.path);
			if (!this.#states.has(entry.key)) continue;
			const fieldErrors = Object.freeze([...(errors[fieldPathToString(entry.path)] ?? [])]);
			this.#patch(entry.key, {
				errors: fieldErrors,
				...(fieldErrors.length > 0 ? { success: undefined } : {}),
				validating: false
			});
		}
		return Object.freeze(accepted);
	}

	cancelValidation(): void {
		for (const key of this.#paths.keys()) {
			this.#validationVersions.set(key, (this.#validationVersions.get(key) ?? 0) + 1);
			this.#patch(key, { validating: false });
		}
	}

	reset(): void {
		this.cancelValidation();
		this.#errors = Object.freeze({});
		for (const key of this.#paths.keys()) this.#states.set(key, INITIAL_STATE);
	}

	focusField(path: FieldPathInput, options: FocusOptions = { preventScroll: true }): boolean {
		const target = this.#orderedFields(path)[0]?.control();
		if (!target) return false;
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

	#patch(key: string, patch: Partial<FormFieldState>): void {
		const current = this.#states.get(key);
		if (current) this.#states.set(key, freezeState({ ...current, ...patch }));
	}
}
