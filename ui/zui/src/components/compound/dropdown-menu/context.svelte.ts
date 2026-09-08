import { getContext, setContext } from 'svelte';

import { createContextKey, type ImportMetaLike } from '../../../runtime/foundation/context-key.js';

export type DropdownMenuFocusStrategy = 'first' | 'last';

export interface ZDropdownMenuContext {
	readonly focusStrategy: DropdownMenuFocusStrategy;
	prepareOpen(strategy: DropdownMenuFocusStrategy): void;
}

const DROPDOWN_MENU_CONTEXT = createContextKey(
	{ hot: (import.meta as ImportMetaLike).hot },
	'zui-dropdown-menu-context'
);

export function provideZDropdownMenu(context: ZDropdownMenuContext): ZDropdownMenuContext {
	setContext(DROPDOWN_MENU_CONTEXT, context);
	return context;
}

export function useZDropdownMenu(): ZDropdownMenuContext {
	const context = getContext<ZDropdownMenuContext | undefined>(DROPDOWN_MENU_CONTEXT);
	if (!context) throw new Error('ZDropdownMenu compound components require ZDropdownMenu.');
	return context;
}
