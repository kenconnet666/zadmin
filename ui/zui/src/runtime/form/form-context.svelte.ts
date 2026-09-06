import { getContext, setContext } from 'svelte';
import { createContextKey } from '../foundation/context-key.js';

import type { ZControlSize } from '../foundation/control-size.js';
import type { FormRegistry } from './form-registry.svelte.js';
import type { FormValueHost } from './form-value-adapter.svelte.js';
import type { FormArrayController, FormArrayOptions } from './form-array.svelte.js';
import type { FieldPath, FieldPathInput } from './field-path.js';
import type { FormListReconcile } from './form-list-reconcile.js';

export type FormListArray<T> = Pick<
	FormArrayController<T, unknown>,
	'rows' | 'append' | 'insert' | 'remove' | 'move' | 'replace' | 'isDirty' | 'resetField'
>;
export interface FormListRegistration {
	readonly path: FieldPath;
	isDirty(path: FieldPath): boolean;
	resetField(path: FieldPath): boolean;
}

export type FormValidationTrigger = 'blur' | 'change' | 'submit';

export interface ZFormContext extends FormValueHost {
	readonly disabled: boolean;
	readonly readonly: boolean;
	readonly preserve: boolean;
	readonly registry: FormRegistry;
	readonly size?: ZControlSize;
	readonly submitted: boolean;
	createArray<T>(path: FieldPathInput, options?: FormArrayOptions<T>): FormListArray<T>;
	registerList(registration: FormListRegistration): () => void;
	reconcileList(change: FormListReconcile): void;
	fieldEvent(instanceId: string, trigger: Exclude<FormValidationTrigger, 'submit'>): void;
}

const FORM_CONTEXT = createContextKey({ hot: import.meta.hot }, 'zui-form-context');

export function provideZForm(context: ZFormContext): ZFormContext {
	setContext(FORM_CONTEXT, context);
	return context;
}

export function useZForm(): ZFormContext {
	const context = getContext<ZFormContext | undefined>(FORM_CONTEXT);
	if (!context) throw new Error('ZFormField requires a parent ZForm.');
	return context;
}
