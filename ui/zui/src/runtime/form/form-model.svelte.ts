import { untrack } from 'svelte';

import {
	fieldPathKey,
	fieldPathStartsWith,
	normalizeFieldPath,
	type FieldPath,
	type FieldPathInput
} from './field-path.js';

export type FormValuesChangeReason = 'array' | 'controller' | 'user';
export type FormValueSnapshot<T> = T extends (...args: never[]) => unknown
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
function equal(left: unknown, right: unknown): boolean {
	if (Object.is(left, right)) return true;
	if (Array.isArray(left) && Array.isArray(right))
		return left.length === right.length && left.every((item, index) => equal(item, right[index]));
	if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;
	if (
		Object.getPrototypeOf(left) !== Object.prototype ||
		Object.getPrototypeOf(right) !== Object.prototype
	)
		return false;
	const leftKeys = Object.keys(left);
	const rightKeys = Object.keys(right);
	return (
		leftKeys.length === rightKeys.length &&
		leftKeys.every(
			(key) =>
				Object.hasOwn(right, key) &&
				equal((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key])
		)
	);
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
	readonly #listeners = new Set<(detail: FormValuesChange<T>) => void>();
	readonly #pathListeners = new Map<
		string,
		{
			readonly path: FieldPath;
			readonly listeners: Map<FormValueListener, unknown>;
		}
	>();
	readonly #options: FormModelOptions<T>;
	#controlledInput?: T;
	#controlledSnapshot?: T;
	#nextRevision = 0;
	#revision = $state(0);
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
	get(path: FieldPathInput): unknown {
		return getFormValue(this.values, path);
	}
	setField(
		path: FieldPathInput,
		value: unknown,
		reason: FormValuesChangeReason = 'controller'
	): boolean {
		return this.setFields([{ path, value }], reason);
	}
	setFields(
		updates: readonly FormFieldUpdate[],
		reason: FormValuesChangeReason = 'controller'
	): boolean {
		const current = untrack(() => this.values);
		let next = current;
		const paths = new Map<string, FieldPath>();
		for (const update of updates) {
			const path = normalizeFieldPath(update.path);
			next = setFormValue(next, path, update.value);
			paths.set(fieldPathKey(path), path);
		}
		const changed = [...paths.values()].filter(
			(path) => !equal(getFormValue(current, path), getFormValue(next, path))
		);
		return this.#publish(next, changed, reason);
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
		this.#notifyInitialization(previous, previousBaseline, next, baseline);
	}
	reset(): void {
		this.#replaceSilent(untrack(() => this.#baseline));
	}
	resetField(path: FieldPathInput): void {
		const normalized = normalizeFieldPath(path);
		const { baseline, current } = untrack(() => ({
			baseline: this.#baseline,
			current: this.values
		}));
		if (hasFormValue(baseline, normalized)) {
			this.#replaceSilent(setFormValue(current, normalized, getFormValue(baseline, normalized)));
			return;
		}
		if (normalized.some((segment) => typeof segment === 'number'))
			throw new TypeError('ZForm resetField cannot delete a missing baseline array path.');
		let preserveDepth = 0;
		for (let index = 1; index < normalized.length; index += 1) {
			if (!hasFormValue(baseline, normalized.slice(0, index))) break;
			preserveDepth = index;
		}
		this.#replaceSilent(deleteFormValue(current, normalized, preserveDepth));
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
			listeners: new Map<FormValueListener, unknown>()
		};
		entry.listeners.set(listener, getFormValue(this.values, normalized));
		this.#pathListeners.set(key, entry);
		return () => {
			entry.listeners.delete(listener);
			if (entry.listeners.size === 0) this.#pathListeners.delete(key);
		};
	}
	#publish(next: T, paths: readonly FieldPath[], reason: FormValuesChangeReason): boolean {
		const current = untrack(() => this.values);
		if (equal(current, next)) return true;
		if (!this.#accept(current, next)) return false;
		const detail = Object.freeze({ changedPaths: Object.freeze([...paths]), reason, values: next });
		this.#options.onValuesChange?.(detail);
		for (const listener of this.#listeners) listener(detail);
		this.#notifyPaths(paths, next);
		return true;
	}
	#replaceSilent(next: T): boolean {
		const previous = untrack(() => this.values);
		if (equal(previous, next)) return true;
		if (!this.#accept(previous, next)) return false;
		this.#notifyPaths(getChangedFormPaths(previous, next), next);
		return true;
	}
	#accept(previous: T, next: T): boolean {
		if (equal(previous, next)) return true;
		if (this.#options.read === undefined) this.#current = next;
		this.#options.write?.(next);
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
	#notifyPaths(paths: readonly FieldPath[], values: T): void {
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
				listener(next);
			}
		}
	}
}
export function createFormModel<T>(options: FormModelOptions<T>): FormModel<T> {
	return new FormModel(options);
}
