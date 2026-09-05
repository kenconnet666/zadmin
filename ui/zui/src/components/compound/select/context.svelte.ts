import { getContext, setContext } from 'svelte';

import type { CompoundLogicalCollectionItem } from '../../../runtime/collection/compound-logical-collection.svelte.js';
import type { LogicalCollectionView } from '../../../runtime/collection/logical-collection.js';
import type { SelectionKey } from '../../../runtime/collection/selection.js';
import type { ZControlSize } from '../../../runtime/foundation/control-size.js';
import { CancelableEvent } from '../../../runtime/foundation/cancelable-event.js';
import type { ChoiceVirtualController } from '../choice-virtualization.js';
import type { ZSelectOption } from './ZSelect.svelte';

export interface SelectItemRecord extends CompoundLogicalCollectionItem<SelectionKey> {
	readonly onSelect?: (event: SelectEvent) => void;
	readonly option?: ZSelectOption;
}

export class SelectEvent extends CancelableEvent {
	constructor(
		readonly originalEvent: KeyboardEvent | MouseEvent,
		readonly value: SelectionKey
	) {
		super();
	}
}

export type SelectOpenFocusStrategy = 'first' | 'last' | 'selected';

export interface ZSelectContext {
	readonly activeId: string | undefined;
	readonly activeKey: SelectionKey | undefined;
	readonly controlId: string;
	readonly dataMode: boolean;
	readonly describedBy: string | undefined;
	readonly disabled: boolean;
	readonly emptyText: string;
	readonly grouped: boolean;
	readonly invalid: boolean;
	readonly loading: boolean;
	readonly loadingText: string;
	readonly open: boolean;
	readonly placeholder: string;
	readonly readonly: boolean;
	readonly required: boolean;
	readonly size: ZControlSize;
	readonly selectedText: string;
	readonly value: SelectionKey | undefined;
	readonly view: LogicalCollectionView<SelectionKey, SelectItemRecord>;
	choose(value: SelectionKey, originalEvent: KeyboardEvent | MouseEvent): SelectEvent;
	handleKey(event: KeyboardEvent): boolean;
	idFor(value: SelectionKey): string;
	isSelected(value: SelectionKey): boolean;
	register(read: () => SelectItemRecord & { readonly element: HTMLDivElement | null }): () => void;
	search(key: string): SelectionKey | undefined;
	setActive(value: SelectionKey): void;
	setOpen(open: boolean, strategy?: SelectOpenFocusStrategy): void;
	setVirtualizer(controller: ChoiceVirtualController<SelectionKey> | null): void;
}

const SELECT_CONTEXT = Symbol('zui-select-context');

export function provideZSelect(context: ZSelectContext): ZSelectContext {
	setContext(SELECT_CONTEXT, context);
	return context;
}

export function useZSelect(): ZSelectContext {
	const context = getContext<ZSelectContext | undefined>(SELECT_CONTEXT);
	if (!context) throw new Error('ZSelect compound components require ZSelect.');
	return context;
}
