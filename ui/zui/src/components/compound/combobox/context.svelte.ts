import { getContext, setContext } from 'svelte';

import type { CompoundLogicalCollectionItem } from '../../../runtime/collection/compound-logical-collection.svelte.js';
import type { LogicalCollectionView } from '../../../runtime/collection/logical-collection.js';
import type { SelectionKey } from '../../../runtime/collection/selection.js';
import { CancelableEvent } from '../../../runtime/foundation/cancelable-event.js';
import type { ChoiceVirtualController } from '../choice-virtualization.js';
import type { ZComboboxOption } from './ZCombobox.svelte';

export interface ComboboxItemRecord extends CompoundLogicalCollectionItem<SelectionKey> {
	readonly onSelect?: (event: ComboboxSelectEvent) => void;
	readonly option?: ZComboboxOption;
}

export class ComboboxSelectEvent extends CancelableEvent {
	constructor(
		readonly originalEvent: KeyboardEvent | MouseEvent,
		readonly value: SelectionKey
	) {
		super();
	}
}

export type ComboboxOpenFocusStrategy = 'first' | 'last' | 'selected';

export interface ZComboboxContext {
	readonly activeId: string | undefined;
	readonly activeKey: SelectionKey | undefined;
	readonly controlId: string;
	readonly dataMode: boolean;
	readonly describedBy: string | undefined;
	readonly disabled: boolean;
	readonly emptyText: string;
	readonly grouped: boolean;
	readonly inputDefaultValue: string;
	readonly inputValue: string;
	readonly invalid: boolean;
	readonly loading: boolean;
	readonly loadingText: string;
	readonly open: boolean;
	readonly openOnFocus: boolean;
	readonly readonly: boolean;
	readonly required: boolean;
	readonly value: SelectionKey | undefined;
	readonly view: LogicalCollectionView<SelectionKey, ComboboxItemRecord>;
	choose(value: SelectionKey, event: KeyboardEvent | MouseEvent): ComboboxSelectEvent;
	handleKey(event: KeyboardEvent): boolean;
	idFor(value: SelectionKey): string;
	isSelected(value: SelectionKey): boolean;
	isVisible(value: SelectionKey): boolean;
	register(
		read: () => ComboboxItemRecord & { readonly element: HTMLDivElement | null }
	): () => void;
	setActive(value: SelectionKey): void;
	setInputValue(value: string): void;
	setOpen(open: boolean, strategy?: ComboboxOpenFocusStrategy): void;
	setVirtualizer(controller: ChoiceVirtualController<SelectionKey> | null): void;
}

const COMBOBOX_CONTEXT = Symbol('zui-combobox-context');

export function provideZCombobox(context: ZComboboxContext): ZComboboxContext {
	setContext(COMBOBOX_CONTEXT, context);
	return context;
}

export function useZCombobox(): ZComboboxContext {
	const context = getContext<ZComboboxContext | undefined>(COMBOBOX_CONTEXT);
	if (!context) throw new Error('ZCombobox compound components require ZCombobox.');
	return context;
}
