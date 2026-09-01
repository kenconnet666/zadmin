import { getContext, setContext } from 'svelte';

import type { CompoundLogicalCollectionItem } from '../../../runtime/collection/compound-logical-collection.svelte.js';
import type { SelectionKey } from '../../../runtime/collection/selection.js';

export type TabsActivationMode = 'automatic' | 'manual';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsPanelMount = 'active-only' | 'keep-mounted' | 'lazy';

export interface TabsCollectionItem extends CompoundLogicalCollectionItem<SelectionKey> {
	readonly element: HTMLButtonElement | null;
	readonly id: string;
}

export interface ZTabsContext {
	readonly activationMode: TabsActivationMode;
	readonly disabled: boolean;
	readonly orientation: TabsOrientation;
	focus(value: SelectionKey): void;
	handleKey(event: KeyboardEvent): boolean;
	isActive(value: SelectionKey): boolean;
	isSelected(value: SelectionKey): boolean;
	panelId(value: SelectionKey): string;
	register(read: () => TabsCollectionItem): () => void;
	restoreFocusFromPanel(): void;
	select(value: SelectionKey): void;
	shouldMountPanel(value: SelectionKey): boolean;
	tabIndex(value: SelectionKey): 0 | -1;
	triggerId(value: SelectionKey): string;
}

const TABS_CONTEXT = Symbol('zui-tabs-context');

export function provideZTabs(context: ZTabsContext): ZTabsContext {
	setContext(TABS_CONTEXT, context);
	return context;
}

export function useZTabs(): ZTabsContext {
	const context = getContext<ZTabsContext | undefined>(TABS_CONTEXT);
	if (!context) throw new Error('ZTabs compound components must be rendered inside ZTabs.');
	return context;
}
