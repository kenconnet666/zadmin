import { getContext, setContext } from 'svelte';

import type {
	CollectionItem,
	CollectionStore
} from '../../../runtime/collection/collection.svelte.js';
import type { RovingFocus } from '../../../runtime/collection/roving-focus.svelte.js';
import type { SelectionKey } from '../../../runtime/collection/selection.js';
import type { Typeahead } from '../../../runtime/collection/typeahead.js';
import { CancelableEvent } from '../../../runtime/foundation/cancelable-event.js';

export type SelectItemRecord = CollectionItem<SelectionKey>;

export class SelectEvent extends CancelableEvent {
	constructor(
		readonly originalEvent: KeyboardEvent | MouseEvent,
		readonly value: SelectionKey
	) {
		super();
	}
}

export interface ZSelectContext {
	readonly collection: CollectionStore<SelectItemRecord>;
	readonly disabled: boolean;
	readonly open: boolean;
	readonly placeholder: string;
	readonly required: boolean;
	readonly roving: RovingFocus<SelectionKey, SelectItemRecord>;
	readonly selectedText: string;
	readonly typeahead: Typeahead<SelectionKey>;
	readonly value: SelectionKey | undefined;
	choose(
		value: SelectionKey,
		originalEvent: KeyboardEvent | MouseEvent,
		onSelect?: (event: SelectEvent) => void
	): SelectEvent;
	register(read: () => SelectItemRecord): () => void;
	setOpen(open: boolean): void;
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
