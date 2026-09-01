import { getContext, setContext } from 'svelte';

import type {
	CollectionItem,
	CollectionStore
} from '../../../runtime/collection/collection.svelte.js';
import type { SelectionKey } from '../../../runtime/collection/selection.js';
import { CancelableEvent } from '../../../runtime/foundation/cancelable-event.js';

export type ComboboxItemRecord = CollectionItem<SelectionKey>;

export class ComboboxSelectEvent extends CancelableEvent {
	constructor(
		readonly originalEvent: KeyboardEvent | MouseEvent,
		readonly value: SelectionKey
	) {
		super();
	}
}

export interface ZComboboxContext {
	readonly activeId: string | undefined;
	readonly activeKey: SelectionKey | undefined;
	readonly collection: CollectionStore<ComboboxItemRecord>;
	readonly controlId: string;
	readonly describedBy: string | undefined;
	readonly disabled: boolean;
	readonly invalid: boolean;
	readonly inputDefaultValue: string;
	readonly inputValue: string;
	readonly open: boolean;
	readonly required: boolean;
	readonly value: SelectionKey | undefined;
	choose(
		value: SelectionKey,
		event: KeyboardEvent | MouseEvent,
		onSelect?: (event: ComboboxSelectEvent) => void
	): void;
	idFor(value: SelectionKey): string;
	matches(textValue: string): boolean;
	move(key: string): SelectionKey | undefined;
	register(read: () => ComboboxItemRecord): () => void;
	setActive(value: SelectionKey): void;
	setInputValue(value: string): void;
	setOpen(open: boolean): void;
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
