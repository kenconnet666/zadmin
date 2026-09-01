import { getContext, setContext } from 'svelte';

export type DropdownMenuFocusStrategy = 'first' | 'last';

export interface ZDropdownMenuContext {
	readonly focusStrategy: DropdownMenuFocusStrategy;
	prepareOpen(strategy: DropdownMenuFocusStrategy): void;
}

const DROPDOWN_MENU_CONTEXT = Symbol('zui-dropdown-menu-context');

export function provideZDropdownMenu(context: ZDropdownMenuContext): ZDropdownMenuContext {
	setContext(DROPDOWN_MENU_CONTEXT, context);
	return context;
}

export function useZDropdownMenu(): ZDropdownMenuContext {
	const context = getContext<ZDropdownMenuContext | undefined>(DROPDOWN_MENU_CONTEXT);
	if (!context) throw new Error('ZDropdownMenu compound components require ZDropdownMenu.');
	return context;
}
