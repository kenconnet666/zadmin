import { getContext, setContext } from 'svelte';

import type { CompoundLogicalCollectionItem } from '../../../runtime/collection/compound-logical-collection.svelte.js';
import type { SelectionKey } from '../../../runtime/collection/selection.js';
import { CancelableEvent } from '../../../runtime/foundation/cancelable-event.js';

export type MenuItemRole = 'menuitem' | 'menuitemcheckbox' | 'menuitemradio';

export interface MenuItemRecord extends CompoundLogicalCollectionItem<SelectionKey> {
	readonly closeOnSelect: boolean;
	readonly element: HTMLElement | null;
	readonly id: string;
	readonly onSelect?: (event: MenuActionEvent) => void;
	readonly role: MenuItemRole;
}

export class MenuActionEvent extends CancelableEvent {
	readonly #defaultActions: Array<() => void> = [];
	#defaultsCommitted = false;

	constructor(
		readonly originalEvent: KeyboardEvent | MouseEvent,
		readonly value: SelectionKey,
		readonly closeOnSelect = true
	) {
		super();
	}

	/** Registers a state write that runs only after every parent action handler accepts the event. */
	deferDefault(action: () => void): void {
		if (this.#defaultsCommitted) {
			throw new Error('MenuActionEvent default actions have already been committed.');
		}
		this.#defaultActions.push(action);
	}

	commitDefaultActions(): void {
		if (this.#defaultsCommitted || this.defaultPrevented) return;
		this.#defaultsCommitted = true;
		for (const action of this.#defaultActions) action();
	}
}

export interface ZMenuContext {
	readonly activeKey: SelectionKey | undefined;
	readonly direction: 'ltr' | 'rtl';
	readonly disabled: boolean;
	activate(value: SelectionKey, originalEvent: KeyboardEvent | MouseEvent): MenuActionEvent;
	claimSubmenu(value: SelectionKey, close: () => void): () => void;
	contains(target: EventTarget | null): boolean;
	dismissPopup(): void;
	focus(value: SelectionKey, reason?: 'pointer' | 'programmatic'): boolean;
	hover(value: SelectionKey): void;
	register(read: () => MenuItemRecord): () => void;
	relayAction(event: MenuActionEvent): void;
	tabIndex(value: SelectionKey): 0 | -1;
}

export interface ZMenuGroupContext {
	readonly key: string;
	readonly labelId: string;
	registerLabel(id: string): () => void;
}

export interface ZMenuRadioGroupContext {
	readonly value: SelectionKey | undefined;
	select(value: SelectionKey): void;
}

const MENU_CONTEXT = Symbol('zui-menu-context');
const MENU_GROUP_CONTEXT = Symbol('zui-menu-group-context');
const MENU_RADIO_GROUP_CONTEXT = Symbol('zui-menu-radio-group-context');

export function provideZMenu(context: ZMenuContext): ZMenuContext {
	setContext(MENU_CONTEXT, context);
	return context;
}

export function provideZMenuGroup(context: ZMenuGroupContext): ZMenuGroupContext {
	setContext(MENU_GROUP_CONTEXT, context);
	return context;
}

export function provideZMenuRadioGroup(context: ZMenuRadioGroupContext): ZMenuRadioGroupContext {
	setContext(MENU_RADIO_GROUP_CONTEXT, context);
	return context;
}

export function useZMenu(): ZMenuContext {
	const context = getContext<ZMenuContext | undefined>(MENU_CONTEXT);
	if (!context) throw new Error('ZMenu compound components require ZMenu.');
	return context;
}

export function useOptionalZMenu(): ZMenuContext | undefined {
	return getContext<ZMenuContext | undefined>(MENU_CONTEXT);
}

export function useOptionalZMenuGroup(): ZMenuGroupContext | undefined {
	return getContext<ZMenuGroupContext | undefined>(MENU_GROUP_CONTEXT);
}

export function useZMenuRadioGroup(): ZMenuRadioGroupContext {
	const context = getContext<ZMenuRadioGroupContext | undefined>(MENU_RADIO_GROUP_CONTEXT);
	if (!context) throw new Error('ZMenuRadioItem requires ZMenuRadioGroup.');
	return context;
}
