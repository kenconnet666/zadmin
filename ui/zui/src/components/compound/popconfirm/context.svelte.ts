import { getContext, setContext } from 'svelte';

export interface ZPopconfirmContext {
	readonly descriptionId: string;
	readonly errorId: string;
	readonly errorMessage: string | undefined;
	readonly pending: boolean;
	readonly titleId: string;
	cancel(): void;
	confirm(event: MouseEvent): void;
	setAction(action: HTMLButtonElement | null): void;
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
