import { getContext, setContext } from 'svelte';

import type { CompoundLogicalCollectionItem } from '../../../runtime/collection/compound-logical-collection.svelte.js';
import type { LogicalCollectionView } from '../../../runtime/collection/logical-collection.js';
import type { SelectionKey } from '../../../runtime/collection/selection.js';
import type { ZControlSize } from '../../../runtime/foundation/control-size.js';
import { CancelableEvent } from '../../../runtime/foundation/cancelable-event.js';
import type { ChoiceVirtualController } from '../choice-virtualization.js';
import type { ZMultiSelectOption } from './ZMultiSelect.svelte';

export interface MultiSelectItemRecord extends CompoundLogicalCollectionItem<SelectionKey> {
	readonly onSelect?: (event: MultiSelectEvent) => void;
	readonly option?: ZMultiSelectOption;
}

export interface MultiSelectTagRecord {
	readonly disabled: boolean;
	readonly label: string;
	readonly value: SelectionKey;
}

export class MultiSelectEvent extends CancelableEvent {
	constructor(
		readonly originalEvent: KeyboardEvent | MouseEvent,
		readonly value: SelectionKey
	) {
		super();
	}
}

export type MultiSelectOpenFocusStrategy = 'first' | 'last' | 'selected';

export interface ZMultiSelectContext {
	readonly activeId: string | undefined;
	readonly activeKey: SelectionKey | undefined;
	readonly clearable: boolean;
	readonly controlId: string;
	readonly dataMode: boolean;
	readonly describedBy: string | undefined;
	readonly disabled: boolean;
	readonly emptyText: string;
	readonly grouped: boolean;
	readonly invalid: boolean;
	readonly loading: boolean;
	readonly loadingText: string;
	readonly maxTagCount: number | undefined;
	readonly open: boolean;
	readonly placeholder: string;
	readonly readonly: boolean;
	readonly required: boolean;
	readonly size: ZControlSize;
	readonly tags: readonly MultiSelectTagRecord[];
	readonly values: readonly SelectionKey[];
	readonly view: LogicalCollectionView<SelectionKey, MultiSelectItemRecord>;
	clear(): boolean;
	handleKey(event: KeyboardEvent): boolean;
	idFor(value: SelectionKey): string;
	isSelected(value: SelectionKey): boolean;
	overflowLabel(hiddenCount: number): string;
	register(
		read: () => MultiSelectItemRecord & { readonly element: HTMLDivElement | null }
	): () => void;
	remove(value: SelectionKey): boolean;
	search(key: string): SelectionKey | undefined;
	setActive(value: SelectionKey): void;
	setOpen(open: boolean, strategy?: MultiSelectOpenFocusStrategy): void;
	setVirtualizer(controller: ChoiceVirtualController<SelectionKey> | null): void;
	toggle(value: SelectionKey, event: KeyboardEvent | MouseEvent): MultiSelectEvent;
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
