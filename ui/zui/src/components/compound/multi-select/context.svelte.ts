import { getContext, setContext } from 'svelte';
import type {
	CollectionItem,
	CollectionStore
} from '../../../runtime/collection/collection.svelte.js';
import type { RovingFocus } from '../../../runtime/collection/roving-focus.svelte.js';
import type { SelectionKey } from '../../../runtime/collection/selection.js';
import type { Typeahead } from '../../../runtime/collection/typeahead.js';
import { CancelableEvent } from '../../../runtime/foundation/cancelable-event.js';
export type MultiSelectItemRecord = CollectionItem<SelectionKey>;
export class MultiSelectEvent extends CancelableEvent {
	constructor(
		readonly originalEvent: KeyboardEvent | MouseEvent,
		readonly value: SelectionKey
	) {
		super();
	}
}
export interface ZMultiSelectContext {
	readonly collection: CollectionStore<MultiSelectItemRecord>;
	readonly disabled: boolean;
	readonly labels: readonly string[];
	readonly open: boolean;
	readonly placeholder: string;
	readonly roving: RovingFocus<SelectionKey, MultiSelectItemRecord>;
	readonly typeahead: Typeahead<SelectionKey>;
	readonly values: readonly SelectionKey[];
	isSelected(value: SelectionKey): boolean;
	register(read: () => MultiSelectItemRecord): () => void;
	setOpen(open: boolean): void;
	toggle(
		value: SelectionKey,
		event: KeyboardEvent | MouseEvent,
		onSelect?: (event: MultiSelectEvent) => void
	): void;
}
const MULTI_SELECT_CONTEXT = Symbol('zui-multi-select-context');
export function provideZMultiSelect(context: ZMultiSelectContext): ZMultiSelectContext {
	setContext(MULTI_SELECT_CONTEXT, context);
	return context;
}
export function useZMultiSelect(): ZMultiSelectContext {
	const context = getContext<ZMultiSelectContext | undefined>(MULTI_SELECT_CONTEXT);
	if (!context) throw new Error('ZMultiSelect compound components require ZMultiSelect.');
	return context;
}
