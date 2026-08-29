import { getContext, setContext } from 'svelte';

import type {
	CollectionItem,
	CollectionStore
} from '../../../runtime/collection/collection.svelte.js';
import type { RovingFocus } from '../../../runtime/collection/roving-focus.svelte.js';
import type { SelectionKey } from '../../../runtime/collection/selection.js';
import type { Typeahead } from '../../../runtime/collection/typeahead.js';

export type MenuItemRecord = CollectionItem<SelectionKey>;

export class MenuActionEvent {
	defaultPrevented = false;

	constructor(
		readonly originalEvent: KeyboardEvent | MouseEvent,
		readonly value: SelectionKey
	) {}

	preventDefault(): void {
		this.defaultPrevented = true;
	}
}

export interface ZMenuContext {
	readonly collection: CollectionStore<MenuItemRecord>;
	readonly roving: RovingFocus<SelectionKey, MenuItemRecord>;
	readonly typeahead: Typeahead<SelectionKey>;
	activate(
		value: SelectionKey,
		originalEvent: KeyboardEvent | MouseEvent,
		onSelect?: (event: MenuActionEvent) => void
	): MenuActionEvent;
}

const MENU_CONTEXT = Symbol('zui-menu-context');

export function provideZMenu(context: ZMenuContext): ZMenuContext {
	setContext(MENU_CONTEXT, context);
	return context;
}

export function useZMenu(): ZMenuContext {
	const context = getContext<ZMenuContext | undefined>(MENU_CONTEXT);
	if (!context) throw new Error('ZMenu compound components require ZMenu.');
	return context;
}
