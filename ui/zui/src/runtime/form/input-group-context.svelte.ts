import { getContext, setContext } from 'svelte';

export interface ZInputGroupContext {
	readonly disabled: boolean;
	readonly invalid: boolean;
}

const INPUT_GROUP_CONTEXT = Symbol('zui-input-group-context');

export function provideZInputGroup(context: ZInputGroupContext): ZInputGroupContext {
	setContext(INPUT_GROUP_CONTEXT, context);
	return context;
}

export function useZInputGroup(): ZInputGroupContext | undefined {
	return getContext<ZInputGroupContext | undefined>(INPUT_GROUP_CONTEXT);
}
