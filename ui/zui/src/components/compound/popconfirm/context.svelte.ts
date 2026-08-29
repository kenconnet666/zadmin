import { getContext, setContext } from 'svelte';

export interface ZPopconfirmContext {
	readonly descriptionId: string;
	readonly titleId: string;
}

const POPCONFIRM_CONTEXT = Symbol('zui-popconfirm-context');

export function provideZPopconfirm(context: ZPopconfirmContext): ZPopconfirmContext {
	setContext(POPCONFIRM_CONTEXT, context);
	return context;
}

export function useZPopconfirm(): ZPopconfirmContext {
	const context = getContext<ZPopconfirmContext | undefined>(POPCONFIRM_CONTEXT);
	if (!context) throw new Error('ZPopconfirm compound components require ZPopconfirm.');
	return context;
}
