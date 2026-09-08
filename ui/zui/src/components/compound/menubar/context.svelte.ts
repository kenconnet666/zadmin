import { getContext, setContext } from 'svelte';

import { createContextKey, type ImportMetaLike } from '../../../runtime/foundation/context-key.js';

import type { CollectionNavigationReason } from '../../../runtime/collection/collection-navigation.svelte.js';
import type { CompoundLogicalCollectionItem } from '../../../runtime/collection/compound-logical-collection.svelte.js';
import type { SelectionKey } from '../../../runtime/collection/selection.js';
import type { ZControlSize } from '../../../runtime/foundation/control-size.js';
import type { DropdownMenuFocusStrategy } from '../dropdown-menu/context.svelte.js';

export interface MenubarCollectionItem extends CompoundLogicalCollectionItem<SelectionKey> {
	readonly element: HTMLButtonElement | null;
}

export interface ZMenubarContext {
	readonly direction: 'ltr' | 'rtl';
	readonly disabled: boolean;
	readonly openValue: SelectionKey | null;
	readonly size: ZControlSize;
	close(value?: SelectionKey): void;
	focus(value: SelectionKey, reason?: CollectionNavigationReason): boolean;
	handleContentKeydown(value: SelectionKey, event: KeyboardEvent): void;
	handleTriggerKeydown(value: SelectionKey, event: KeyboardEvent): void;
	leaveTarget(backward: boolean): HTMLElement | null;
	pointerMove(value: SelectionKey): void;
	register(read: () => MenubarCollectionItem): () => void;
	registerPrepare(
		value: SelectionKey,
		prepare: (strategy: DropdownMenuFocusStrategy) => void
	): () => void;
	registerRestore(value: SelectionKey, restore: (target: HTMLElement | null) => void): () => void;
	setOpen(value: SelectionKey, open: boolean, strategy?: DropdownMenuFocusStrategy): void;
	tabIndex(value: SelectionKey, disabled?: boolean): 0 | -1;
}

export interface ZMenubarMenuContext {
	readonly disabled: boolean;
	readonly value: SelectionKey;
}

const MENUBAR_CONTEXT = createContextKey(
	{ hot: (import.meta as ImportMetaLike).hot },
	'zui-menubar-context'
);
const MENUBAR_MENU_CONTEXT = createContextKey(
	{ hot: (import.meta as ImportMetaLike).hot },
	'zui-menubar-menu-context'
);

export function provideZMenubar(context: ZMenubarContext): ZMenubarContext {
	setContext(MENUBAR_CONTEXT, context);
	return context;
}

export function provideZMenubarMenu(context: ZMenubarMenuContext): ZMenubarMenuContext {
	setContext(MENUBAR_MENU_CONTEXT, context);
	return context;
}

export function useZMenubar(): ZMenubarContext {
	const context = getContext<ZMenubarContext | undefined>(MENUBAR_CONTEXT);
	if (!context) throw new Error('ZMenubar compound components require ZMenubar.');
	return context;
}

export function useZMenubarMenu(): ZMenubarMenuContext {
	const context = getContext<ZMenubarMenuContext | undefined>(MENUBAR_MENU_CONTEXT);
	if (!context) throw new Error('ZMenubarTrigger and ZMenubarContent require ZMenubarMenu.');
	return context;
}
