import { getContext, setContext } from 'svelte';

import type { CollectionItem, CollectionStore } from '../../../runtime/collection.svelte.js';

export type TabsActivationMode = 'automatic' | 'manual';
export type TabsOrientation = 'horizontal' | 'vertical';

export interface TabsCollectionItem extends CollectionItem<string> {
	readonly textValue: string;
}

export interface ZTabsContext {
	readonly activationMode: TabsActivationMode;
	readonly collection: CollectionStore<TabsCollectionItem>;
	readonly disabled: boolean;
	readonly orientation: TabsOrientation;
	focus(value: string): void;
	handleKey(event: KeyboardEvent): void;
	isSelected(value: string): boolean;
	panelId(value: string): string;
	register(read: () => TabsCollectionItem): () => void;
	select(value: string): void;
	tabIndex(value: string): 0 | -1;
	triggerId(value: string): string;
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
