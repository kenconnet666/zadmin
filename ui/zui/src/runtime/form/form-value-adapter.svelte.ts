import { getContext, setContext, tick, untrack } from 'svelte';
import {
	ControllableState,
	sameStateValue,
	type ControllableStateOptions
} from '../foundation/controllable-state.svelte.js';
import { createContextKey } from '../foundation/context-key.js';
import type { FieldPath } from './field-path.js';

/** The control-facing subset deliberately erases the model's whole-form generic. */
export interface FormValueModel {
	readonly values: unknown;
	get(path: FieldPath): unknown;
	setField(path: FieldPath, value: unknown, reason: 'user' | 'controller'): boolean;
	isDirty(path: FieldPath): boolean;
}
export interface FormValueHost {
	readonly model?: FormValueModel;
	registerValueControl(instanceId: string, element: () => HTMLElement | null): () => void;
	controlValueChanged(instanceId: string): void;
}
export interface FormValueScope {
	readonly host: FormValueHost;
	readonly instanceId: string;
	readonly path: FieldPath;
}
const VALUE_SCOPE = createContextKey({ hot: import.meta.hot }, 'zui-form-value-scope');

export function provideFormValueScope(scope: FormValueScope): void {
	setContext(VALUE_SCOPE, scope);
}
export function useFormValueScope(): FormValueScope | undefined {
	return getContext(VALUE_SCOPE);
}
/** A compound value owner hides its scope from auxiliary descendant controls. */
export function claimFormValueScope(): FormValueScope | undefined {
	const scope = useFormValueScope();
	setContext(VALUE_SCOPE, undefined);
	return scope;
}
export interface FormControlStateOptions<T> extends ControllableStateOptions<T> {
	readonly element: () => HTMLElement | null;
	readonly normalizeModelValue: (value: unknown) => T;
	readonly owner: string;
	readonly syncNative?: (value: T) => void;
}

export class FormControlState<T> {
	readonly #native: ControllableState<T>;
	readonly #options: FormControlStateOptions<T>;
	readonly #scope?: FormValueScope;
	constructor(options: FormControlStateOptions<T>, scope?: FormValueScope) {
		this.#options = options;
		this.#scope = scope;
		this.#native = new ControllableState(options);
	}
	get modelOwned(): boolean {
		return this.#scope?.host.model !== undefined;
	}
	get current(): T {
		const model = this.#scope?.host.model;
		if (!model || !this.#scope) return this.#native.current;
		if (this.#options.read() !== undefined)
			throw new TypeError(
				`${this.#options.owner} cannot combine a controlled value with ZForm model ownership.`
			);
		return this.#options.normalizeModelValue(model.get(this.#scope.path));
	}
	setFromUser(value: T): boolean {
		if (sameStateValue(this.current, value)) return true;
		const model = this.#scope?.host.model;
		if (!model || !this.#scope) {
			this.#native.setFromUser(value);
			return true;
		}
		if (!model.setField(this.#scope.path, value, 'user')) return false;
		this.#options.onChange?.()?.(value);
		return true;
	}
	reconcile(value: T): boolean {
		const model = this.#scope?.host.model;
		if (model && this.#scope) return model.setField(this.#scope.path, value, 'controller');
		this.#options.write(value);
		return true;
	}
	reset(): void {
		const element = this.#options.element();
		const model = this.#scope?.host.model;
		if (!model) this.#native.reset();
		// Browser reset may change DOM even when the authoritative value is unchanged or rejects reset.
		void tick().then(() => {
			if (
				element?.isConnected &&
				this.#options.element() === element &&
				this.#scope?.host.model === model
			)
				this.#options.syncNative?.(this.current);
		});
	}
}

/** Call during component setup, just like getContext; owns only registration effects. */
export function createFormControlState<T>(
	options: FormControlStateOptions<T>,
	scope: FormValueScope | undefined = useFormValueScope()
): FormControlState<T> {
	const state = new FormControlState(options, scope);
	$effect(() => {
		if (!scope || !options.element()) return;
		return scope.host.registerValueControl(scope.instanceId, options.element);
	});
	$effect(() => {
		state.current;
		if (scope) untrack(() => scope.host.controlValueChanged(scope.instanceId));
	});
	return state;
}
