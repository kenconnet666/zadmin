import { getContext, setContext } from 'svelte';

export interface ZFieldContext {
	readonly controlId: string;
	readonly describedBy?: string;
	readonly disabled: boolean;
	readonly invalid: boolean;
	readonly name?: string;
	readonly readonly: boolean;
	readonly required: boolean;
}

const FIELD_CONTEXT = Symbol('zui-field-context');

export function provideZField(read: () => ZFieldContext): ZFieldContext {
	const context: ZFieldContext = {
		get controlId() {
			return read().controlId;
		},
		get describedBy() {
			return read().describedBy;
		},
		get disabled() {
			return read().disabled;
		},
		get invalid() {
			return read().invalid;
		},
		get name() {
			return read().name;
		},
		get readonly() {
			return read().readonly;
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
