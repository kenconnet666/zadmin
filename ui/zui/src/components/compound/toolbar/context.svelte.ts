import { getContext, setContext } from 'svelte';
import type { Attachment } from 'svelte/attachments';

import { createContextKey, type ImportMetaLike } from '../../../runtime/foundation/context-key.js';
import type { CollectionNavigationReason } from '../../../runtime/collection/collection-navigation.svelte.js';
import type { CompoundLogicalCollectionItem } from '../../../runtime/collection/compound-logical-collection.svelte.js';
import type { SelectionKey } from '../../../runtime/collection/selection.js';
import type { ZControlSize } from '../../../runtime/foundation/control-size.js';
import type {
	NavigationDirection,
	NavigationOrientation
} from '../../../runtime/collection/list-navigation.js';

export type ToolbarKeyPolicy = 'control' | 'toolbar';
export type ToolbarOrientation = Exclude<NavigationOrientation, 'both'>;

export interface ToolbarCollectionItem extends CompoundLogicalCollectionItem<SelectionKey> {
	readonly element: HTMLElement | null;
	readonly keyPolicy: ToolbarKeyPolicy;
}

export interface ToolbarItemAttributes {
	readonly 'aria-disabled'?: true;
	readonly disabled?: boolean;
	readonly tabindex: 0 | -1;
	readonly [key: symbol]: Attachment<Element>;
}

export interface ZToolbarContext {
	readonly direction: NavigationDirection;
	readonly disabled: boolean;
	readonly orientation: ToolbarOrientation;
	readonly size: ZControlSize;
	focus(value: SelectionKey, reason?: CollectionNavigationReason): boolean;
	owns(element: HTMLElement | null): boolean;
	register(read: () => ToolbarCollectionItem): () => void;
	tabIndex(value: SelectionKey, itemDisabled?: boolean): 0 | -1;
}

const TOOLBAR_CONTEXT = createContextKey(
	{ hot: (import.meta as ImportMetaLike).hot },
	'zui-toolbar-context'
);

export function provideZToolbar(context: ZToolbarContext): ZToolbarContext {
	setContext(TOOLBAR_CONTEXT, context);
	return context;
}

export function useOptionalZToolbar(): ZToolbarContext | undefined {
	return getContext<ZToolbarContext | undefined>(TOOLBAR_CONTEXT);
}

export function useZToolbar(): ZToolbarContext {
	const context = useOptionalZToolbar();
	if (!context) throw new Error('ZToolbarItem must be rendered inside ZToolbar.');
	return context;
}
