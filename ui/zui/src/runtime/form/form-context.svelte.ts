import { getContext, setContext } from 'svelte';
import { createContextKey } from '../foundation/context-key.js';

import type { ZControlSize } from '../foundation/control-size.js';
import type { FormRegistry } from './form-registry.svelte.js';
import type { FormValueHost } from './form-value-adapter.svelte.js';

export type FormValidationTrigger = 'blur' | 'change' | 'submit';

export interface ZFormContext extends FormValueHost {
	readonly disabled: boolean;
	readonly readonly: boolean;
	readonly registry: FormRegistry;
	readonly size?: ZControlSize;
	readonly submitted: boolean;
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
