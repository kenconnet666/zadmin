import { getContext, setContext } from 'svelte';

import type { FormRegistry } from './form-registry.svelte.js';

export type FormValidationTrigger = 'blur' | 'change' | 'submit';

export interface ZFormContext {
	readonly registry: FormRegistry;
	readonly submitted: boolean;
	fieldEvent(name: string, trigger: Exclude<FormValidationTrigger, 'submit'>): void;
}

const FORM_CONTEXT = Symbol('zui-form-context');

export function provideZForm(context: ZFormContext): ZFormContext {
	setContext(FORM_CONTEXT, context);
	return context;
}

export function useZForm(): ZFormContext {
	const context = getContext<ZFormContext | undefined>(FORM_CONTEXT);
	if (!context) throw new Error('ZFormField requires a parent ZForm.');
	return context;
}
