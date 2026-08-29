import { getContext, setContext } from 'svelte';

import type { IcssClassName } from '../icss/types.js';

export interface ZFieldContext {
	readonly controlClass: IcssClassName;
	readonly controlId: string;
	readonly describedBy?: string;
	readonly invalid: boolean;
	readonly required: boolean;
}

const FIELD_CONTEXT = Symbol('zui-field-context');

export function provideZField(read: () => ZFieldContext): ZFieldContext {
	const context: ZFieldContext = {
		get controlClass() {
			return read().controlClass;
		},
		get controlId() {
			return read().controlId;
		},
		get describedBy() {
			return read().describedBy;
		},
		get invalid() {
			return read().invalid;
		},
		get required() {
			return read().required;
		}
	};
	setContext(FIELD_CONTEXT, context);
	return context;
}

export function useZField(): ZFieldContext | undefined {
	return getContext<ZFieldContext | undefined>(FIELD_CONTEXT);
}
