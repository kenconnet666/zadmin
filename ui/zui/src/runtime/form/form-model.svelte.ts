import { untrack } from 'svelte';

import {
	fieldPathKey,
	fieldPathStartsWith,
	normalizeFieldPath,
	type FieldPath,
	type FieldPathInput
} from './field-path.js';
import {
	copyFormDateValue,
	sameFormValue as equal,
	type FormDateValue
} from './form-value-equality.js';

export type FormValuesChangeReason = 'array' | 'controller' | 'user';
export type FormValueSnapshot<T> = T extends FormDateValue
	? T
	: T extends (...args: never[]) => unknown
		? T
		: T extends readonly unknown[]
			? { readonly [TKey in keyof T]: FormValueSnapshot<T[TKey]> }
			: T extends object
				? { readonly [TKey in keyof T]: FormValueSnapshot<T[TKey]> }
				: T;
export interface FormValuesChange<T> {
	readonly changedPaths: readonly FieldPath[];
	readonly reason: FormValuesChangeReason;
	readonly values: FormValueSnapshot<T>;
}
export interface FormFieldUpdate {
	readonly path: FieldPathInput;
	readonly value: unknown;
}
/** @internal Commits metadata that must become visible before value observers run. */
export interface FormAcceptedWrite {
	commit(): void;
}
export interface FormInitializeOptions {
	readonly keepDirtyValues?: boolean;
}
export interface FormModelOptions<T> {
	readonly defaultValues: T;
	readonly onValuesChange?: (detail: FormValuesChange<T>) => void;
	readonly read?: () => T | undefined;
	readonly values?: T;
	readonly write?: (values: FormValueSnapshot<T>) => void;
}
export type FormValueListener = (value: unknown) => void;
const DELETE_VALUE = Symbol('delete-form-value');

function immutable<T>(value: T): T {
	const dateValue = copyFormDateValue(value);
	if (dateValue !== undefined) return dateValue as T;
	if (Array.isArray(value)) return Object.freeze(value.map(immutable)) as T;
	if (
		value !== null &&
		typeof value === 'object' &&
		Object.getPrototypeOf(value) === Object.prototype
	) {
		return Object.freeze(
			Object.fromEntries(Object.entries(value).map(([key, item]) => [key, immutable(item)]))
		) as T;
	}
	return value;
}
function isPlainObject(value: unknown): value is Record<string, unknown> {
	return (
		value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype
	);
}
function preserveDirtyValues<T>(current: T, baseline: T, initialized: T): T {
	function visit(
		currentValue: unknown,
		baselineValue: unknown,
		initializedValue: unknown
	): unknown {
		if (equal(currentValue, baselineValue)) return initializedValue;
		if (
			!isPlainObject(currentValue) ||
			!isPlainObject(baselineValue) ||
			!isPlainObject(initializedValue)
		)
			return currentValue;
		const result: Record<string, unknown> = {};
		const keys = new Set([
			...Object.keys(initializedValue),
			...Object.keys(baselineValue),
			...Object.keys(currentValue)
		]);
		for (const key of keys) {
			const hasCurrent = Object.hasOwn(currentValue, key);
			const hasBaseline = Object.hasOwn(baselineValue, key);
			const hasInitialized = Object.hasOwn(initializedValue, key);
			let value: unknown;
			if (hasCurrent !== hasBaseline) {
				if (!hasCurrent) continue;
				value = currentValue[key];
			} else if (!hasCurrent) {
				if (!hasInitialized) continue;
				value = initializedValue[key];
			} else if (!hasInitialized) {
				if (equal(currentValue[key], baselineValue[key])) continue;
				value = currentValue[key];
			} else {
				value = visit(currentValue[key], baselineValue[key], initializedValue[key]);
			}
			Object.defineProperty(result, key, {
				configurable: true,
				enumerable: true,
				value,
				writable: true
			});
		}
		return result;
	}
	return immutable(visit(current, baseline, initialized)) as T;
}
export function getFormValue(values: unknown, path: FieldPathInput): unknown {
	let current = values;
	for (const segment of normalizeFieldPath(path)) {
		if (current === null || typeof current !== 'object') return undefined;
		if (!Object.hasOwn(current, segment)) return undefined;
		current = (current as Record<string | number, unknown>)[segment];
	}
	return current;
}
function hasFormValue(values: unknown, path: FieldPath): boolean {
	let current = values;
	for (const segment of path) {
		if (current === null || typeof current !== 'object' || !Object.hasOwn(current, segment))
			return false;
		current = (current as Record<string | number, unknown>)[segment];
	}
	return true;
}
function isDirtyAt(values: unknown, baseline: unknown, path: FieldPath): boolean {
	return (
		hasFormValue(values, path) !== hasFormValue(baseline, path) ||
		!equal(getFormValue(values, path), getFormValue(baseline, path))
	);
}
function isDirtyFrom(
	values: unknown,
	baseline: unknown,
	path: FieldPath,
	baselinePath?: FieldPath
): boolean {
	return (
		hasFormValue(values, path) !==
			(baselinePath === undefined ? false : hasFormValue(baseline, baselinePath)) ||
		!equal(
			getFormValue(values, path),
			baselinePath === undefined ? undefined : getFormValue(baseline, baselinePath)
		)
	);
}
function deleteFormValue<T>(values: T, path: FieldPath, preserveDepth: number): T {
	function visit(current: unknown, index: number): unknown | typeof DELETE_VALUE {
		if (current === null || typeof current !== 'object' || !Object.hasOwn(current, path[index]!))
			return current;
		const copy: Record<string | number, unknown> | unknown[] = Array.isArray(current)
			? [...current]
			: { ...(current as Record<string, unknown>) };
		const segment = path[index]!;
		if (index === path.length - 1) Reflect.deleteProperty(copy, segment);
		else {
			const child = visit((current as Record<string | number, unknown>)[segment], index + 1);
			if (child === DELETE_VALUE) Reflect.deleteProperty(copy, segment);
			else
				Object.defineProperty(copy, segment, {
					value: child,
					writable: true,
					configurable: true,
					enumerable: true
				});
		}
		return Reflect.ownKeys(copy).length === 0 && index > preserveDepth ? DELETE_VALUE : copy;
	}
	const result = visit(values, 0);
	return immutable(result === DELETE_VALUE ? {} : result) as T;
}
export function setFormValue<T>(values: T, pathInput: FieldPathInput, value: unknown): T {
	const path = normalizeFieldPath(pathInput);
	if (
		path.some(
			(segment) => segment === '__proto__' || segment === 'constructor' || segment === 'prototype'
		)
	)
		throw new TypeError('ZForm model paths cannot address object prototype properties.');
	function visit(current: unknown, index: number): unknown {
		const segment = path[index]!;
		const source =
			current !== null && typeof current === 'object'
				? current
				: typeof segment === 'number'
					? []
					: {};
		const copy: Record<string | number, unknown> | unknown[] = Array.isArray(source)
			? [...source]
			: { ...(source as Record<string, unknown>) };
		Object.defineProperty(copy, segment, {
			configurable: true,
			enumerable: true,
			value:
				index === path.length - 1
					? immutable(value)
					: visit((source as Record<string | number, unknown>)[segment], index + 1),
			writable: true
		});
		return copy;
	}
	return immutable(visit(values, 0)) as T;
}
export function getChangedFormPaths(left: unknown, right: unknown): readonly FieldPath[] {
	if (equal(left, right)) return [];
	if (left && right && typeof left === 'object' && typeof right === 'object') {
		// Structural diff scratch is returned as an immutable path snapshot, never rendered directly.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
		const rootArray = Array.isArray(left) || Array.isArray(right);
		const segment = (key: string): string | number => {
			if (!rootArray) return key;
			const index = Number(key);
			return Number.isSafeInteger(index) && index >= 0 && String(index) === key ? index : key;
		};
		return Object.freeze(
			[...keys]
				.filter(
					(key) =>
						!equal((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key])
				)
				.map((key) => Object.freeze([segment(key)]))
		);
	}
	return Object.freeze([Object.freeze(['value'])]);
}

export class FormModel<T> {
	#baseline: T;
	#current: T;
	/* eslint-disable svelte/prefer-svelte-reactivity -- Imperative listener membership; #revision publishes committed values. */
	readonly #listeners = new Set<(detail: FormValuesChange<T>) => void>();
	readonly #pathListeners = new Map<
		string,
		{
			readonly path: FieldPath;
			readonly listeners: Map<FormValueListener, unknown>;
		}
	>();
	/* eslint-enable svelte/prefer-svelte-reactivity */
	readonly #publications: {
		readonly detail: FormValuesChange<T>;
		readonly paths: readonly FieldPath[];
		readonly values: FormValueSnapshot<T>;
	}[] = [];
	readonly #options: FormModelOptions<T>;
	#publishing = false;
	#controlledInput?: T;
	#controlledSnapshot?: T;
	#nextRevision = 0;
	#revision = $state(0);
	#globalResetVersion = 0;
	#nextResetVersion = 0;
	#resetRevision = $state(0);
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Reset-version metadata is published through #resetRevision.
	readonly #resetVersions = new Map<
		string,
		{ readonly path: FieldPath; readonly version: number }
	>();
	constructor(options: FormModelOptions<T>) {
		this.#options = options;
		this.#baseline = $state.raw(immutable(options.defaultValues));
		const controlled = options.read?.();
		this.#current = $state.raw(
			immutable(
				controlled !== undefined
					? controlled
					: options.values !== undefined
						? options.values
						: options.defaultValues
			)
		);
	}
	get values(): T {
		this.#revision;
		const controlled = this.#options.read?.();
		if (controlled === undefined) return this.#current;
		if (
			!Object.is(controlled, this.#controlledInput) ||
			this.#controlledSnapshot === undefined ||
			!equal(controlled, this.#controlledSnapshot)
		) {
			this.#controlledInput = controlled;
			this.#controlledSnapshot = immutable(controlled);
		}
		return this.#controlledSnapshot!;
	}
	get defaultValues(): T {
		return this.#baseline;
	}
	get dirty(): boolean {
		return !equal(this.values, this.#baseline);
	}
	isDirty(path: FieldPathInput): boolean {
		const normalized = normalizeFieldPath(path);
		return isDirtyAt(this.values, this.#baseline, normalized);
	}
	/** @internal Compares a current address with the baseline address of the same stable row. */
	isDirtyFrom(path: FieldPathInput, baselinePath?: FieldPathInput): boolean {
		return isDirtyFrom(
			this.values,
			this.#baseline,
			normalizeFieldPath(path),
			baselinePath === undefined ? undefined : normalizeFieldPath(baselinePath)
		);
	}
	/** @internal Monotonic reset signal for identity-bearing helpers such as FormArrayController. */
	getResetVersion(path: FieldPathInput): number {
		this.#resetRevision;
		const normalized = normalizeFieldPath(path);
		let version = this.#globalResetVersion;
		for (const reset of this.#resetVersions.values())
			if (fieldPathStartsWith(normalized, reset.path)) version = Math.max(version, reset.version);
		return version;
	}
	/** @internal Total reset revision used to distinguish new scope resets from address history. */
	getResetRevision(): number {
		this.#resetRevision;
		return this.#nextResetVersion;
	}
	get(path: FieldPathInput): unknown {
		return getFormValue(this.values, path);
	}
	setField(
		path: FieldPathInput,
		value: unknown,
		reason: FormValuesChangeReason = 'controller',
		acceptedWrite?: FormAcceptedWrite
	): boolean {
		return this.setFields([{ path, value }], reason, acceptedWrite);
	}
	setFields(
		updates: readonly FormFieldUpdate[],
		reason: FormValuesChangeReason = 'controller',
		acceptedWrite?: FormAcceptedWrite
	): boolean {
		const current = untrack(() => this.values);
		let next = current;
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Per-call changed-path deduplication snapshot.
		const paths = new Map<string, FieldPath>();
		for (const update of updates) {
			const path = normalizeFieldPath(update.path);
			next = setFormValue(next, path, update.value);
			paths.set(fieldPathKey(path), path);
		}
		const changed = [...paths.values()].filter(
			(path) => !equal(getFormValue(current, path), getFormValue(next, path))
		);
		return this.#publish(next, changed, reason, acceptedWrite);
	}
	setValues(next: T | ((current: T) => T), reason: FormValuesChangeReason = 'controller'): boolean {
		const current = untrack(() => this.values);
		const value = immutable(
			typeof next === 'function' ? (next as (current: T) => T)(current) : next
		);
		return this.#publish(value, getChangedFormPaths(current, value), reason);
	}
	syncExternal(values: T): void {
		if (this.#options.read)
			throw new TypeError('ZForm controlled models synchronize through their read owner.');
		const previous = untrack(() => this.#current);
		const next = immutable(values);
		if (equal(previous, next)) return;
		this.#current = next;
		this.#notifyPaths(getChangedFormPaths(previous, this.#current), this.#current);
	}
	initialize(values: T, options: FormInitializeOptions = {}): void {
		const { previous, previousBaseline } = untrack(() => ({
			previous: this.values,
			previousBaseline: this.#baseline
		}));
		const baseline = immutable(values);
		const next = options.keepDirtyValues
			? preserveDirtyValues(previous, previousBaseline, baseline)
			: baseline;
		if (!this.#accept(previous, next)) return;
		if (!equal(previousBaseline, baseline)) this.#baseline = baseline;
		if (!options.keepDirtyValues) this.#markReset();
		this.#notifyInitialization(previous, previousBaseline, next, baseline);
	}
	reset(): void {
		this.#replaceSilent(
			untrack(() => this.#baseline),
			() => this.#markReset()
		);
	}
	resetField(path: FieldPathInput): void {
		this.resetFieldTo(path, path);
	}
	/** @internal Resets a stable-row address from its corresponding baseline address. */
	resetFieldTo(path: FieldPathInput, baselinePath?: FieldPathInput): boolean {
		const normalized = normalizeFieldPath(path);
		const normalizedBaseline =
			baselinePath === undefined ? undefined : normalizeFieldPath(baselinePath);
		const { baseline, current } = untrack(() => ({
			baseline: this.#baseline,
			current: this.values
		}));
		const markReset = () => this.#markReset(normalized);
		let accepted: boolean;
		if (normalizedBaseline && hasFormValue(baseline, normalizedBaseline)) {
			accepted = this.#replaceSilent(
				setFormValue(current, normalized, getFormValue(baseline, normalizedBaseline)),
				markReset
			);
		} else {
			if (typeof normalized.at(-1) === 'number')
				throw new TypeError(
					'ZForm resetField cannot delete a missing baseline array path; use FormArray.remove.'
				);
			let preserveDepth = 0;
			for (let index = 1; index < normalized.length; index += 1) {
				if (!hasFormValue(baseline, normalized.slice(0, index))) break;
				preserveDepth = index;
			}
			for (let index = 0; index < normalized.length; index += 1)
				if (typeof normalized[index] === 'number')
					preserveDepth = Math.max(preserveDepth, index + 1);
			accepted = this.#replaceSilent(
				deleteFormValue(current, normalized, preserveDepth),
				markReset
			);
		}
		return accepted;
	}
	/** @internal Removes an unmounted model field without publishing a business change. */
	removeFieldValue(path: FieldPathInput): boolean {
		const normalized = normalizeFieldPath(path);
		if (typeof normalized.at(-1) === 'number')
			throw new TypeError(
				'ZForm cannot remove an array row during field unmount; use FormArray.remove.'
			);
		const { baseline, current } = untrack(() => ({
			baseline: this.#baseline,
			current: this.values
		}));
		let preserveDepth = 0;
		for (let index = 1; index < normalized.length; index += 1) {
			if (!hasFormValue(baseline, normalized.slice(0, index))) break;
			preserveDepth = index;
		}
		for (let index = 0; index < normalized.length; index += 1)
			if (typeof normalized[index] === 'number') preserveDepth = Math.max(preserveDepth, index + 1);
		return this.#replaceSilent(deleteFormValue(current, normalized, preserveDepth));
	}
	subscribe(listener: (detail: FormValuesChange<T>) => void): () => void {
		this.#listeners.add(listener);
		return () => this.#listeners.delete(listener);
	}
	subscribeValue(path: FieldPathInput, listener: FormValueListener): () => void {
		const key = fieldPathKey(path);
		const normalized = normalizeFieldPath(path);
		const entry = this.#pathListeners.get(key) ?? {
			path: normalized,
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Imperative subscribers retain their last published value.
			listeners: new Map<FormValueListener, unknown>()
		};
		entry.listeners.set(listener, getFormValue(this.values, normalized));
		this.#pathListeners.set(key, entry);
		return () => {
			entry.listeners.delete(listener);
			if (entry.listeners.size === 0) this.#pathListeners.delete(key);
		};
	}
	#publish(
		next: T,
		paths: readonly FieldPath[],
		reason: FormValuesChangeReason,
		acceptedWrite?: FormAcceptedWrite
	): boolean {
		const current = untrack(() => this.values);
		if (equal(current, next)) {
			acceptedWrite?.commit();
			return true;
		}
		let accepted: boolean;
		try {
			accepted = this.#accept(current, next);
		} catch (error) {
			if (
				equal(
					untrack(() => this.values),
					next
				)
			)
				acceptedWrite?.commit();
			throw error;
		}
		if (!accepted) return false;
		acceptedWrite?.commit();
		const snapshot = next as FormValueSnapshot<T>;
		const detail = Object.freeze({
			changedPaths: Object.freeze([...paths]),
			reason,
			values: snapshot
		}) satisfies FormValuesChange<T>;
		this.#queuePublication(detail, paths, snapshot);
		return true;
	}
	#queuePublication(
		detail: FormValuesChange<T>,
		paths: readonly FieldPath[],
		values: FormValueSnapshot<T>
	): void {
		this.#publications.push({ detail, paths, values });
		if (this.#publishing) return;
		this.#publishing = true;
		let failed = false;
		let failure: unknown;
		const recordFailure = (error: unknown) => {
			if (failed) return;
			failed = true;
			failure = error;
		};
		try {
			while (this.#publications.length > 0) {
				const publication = this.#publications.shift()!;
				for (const listener of [this.#options.onValuesChange, ...this.#listeners]) {
					try {
						listener?.(publication.detail);
					} catch (error) {
						recordFailure(error);
					}
				}
				this.#notifyPaths(publication.paths, publication.values, recordFailure);
			}
		} finally {
			this.#publishing = false;
		}
		if (failed) throw failure;
	}
	#replaceSilent(next: T, accepted?: () => void): boolean {
		const previous = untrack(() => this.values);
		if (equal(previous, next)) {
			accepted?.();
			return true;
		}
		if (!this.#accept(previous, next)) return false;
		accepted?.();
		this.#notifyPaths(getChangedFormPaths(previous, next), next);
		return true;
	}
	#accept(previous: T, next: T): boolean {
		if (equal(previous, next)) return true;
		if (this.#options.read === undefined) this.#current = next;
		this.#options.write?.(next as FormValueSnapshot<T>);
		if (
			!equal(
				untrack(() => this.values),
				next
			)
		)
			return false;
		if (this.#options.read !== undefined) this.#revision = ++this.#nextRevision;
		return true;
	}
	#notifyInitialization(previous: T, previousBaseline: T, next: T, baseline: T): void {
		for (const entry of this.#pathListeners.values()) {
			const nextValue = getFormValue(next, entry.path);
			const dirtyChanged =
				isDirtyAt(previous, previousBaseline, entry.path) !== isDirtyAt(next, baseline, entry.path);
			for (const [listener, previousValue] of entry.listeners) {
				if (!dirtyChanged && equal(previousValue, nextValue)) continue;
				entry.listeners.set(listener, nextValue);
				listener(nextValue);
			}
		}
	}
	#notifyPaths(
		paths: readonly FieldPath[],
		values: unknown,
		onError?: (error: unknown) => void
	): void {
		for (const entry of this.#pathListeners.values()) {
			if (
				!paths.some(
					(path) => fieldPathStartsWith(path, entry.path) || fieldPathStartsWith(entry.path, path)
				)
			)
				continue;
			const next = getFormValue(values, entry.path);
			for (const [listener, previous] of entry.listeners) {
				if (equal(previous, next)) continue;
				entry.listeners.set(listener, next);
				try {
					listener(next);
				} catch (error) {
					if (!onError) throw error;
					onError(error);
				}
			}
		}
	}
	#markReset(path?: FieldPath): void {
		const version = ++this.#nextResetVersion;
		if (path) this.#resetVersions.set(fieldPathKey(path), { path, version });
		else this.#globalResetVersion = version;
		this.#resetRevision = version;
	}
}
export function createFormModel<T>(options: FormModelOptions<T>): FormModel<T> {
	return new FormModel(options);
}
