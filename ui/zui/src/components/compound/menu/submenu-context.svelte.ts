import { getContext, setContext } from 'svelte';

import type { SelectionKey } from '../../../runtime/collection/selection.js';

export type MenuSubFocusStrategy = 'first' | 'last';

export interface ZMenuSubContext {
	readonly focusStrategy: MenuSubFocusStrategy;
	readonly open: boolean;
	readonly trigger: HTMLElement | null;
	close(): void;
	openWith(strategy: MenuSubFocusStrategy): void;
	setTrigger(value: SelectionKey, trigger: HTMLElement | null): void;
}

const MENU_SUB_CONTEXT = Symbol('zui-menu-sub-context');

export function provideZMenuSub(context: ZMenuSubContext): ZMenuSubContext {
	setContext(MENU_SUB_CONTEXT, context);
	return context;
}

export function useZMenuSub(): ZMenuSubContext {
	const context = getContext<ZMenuSubContext | undefined>(MENU_SUB_CONTEXT);
	if (!context) throw new Error('ZMenuSub compound components require ZMenuSub.');
	return context;
}
