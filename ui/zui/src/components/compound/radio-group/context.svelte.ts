import { getContext, setContext } from 'svelte';

import type { CompoundLogicalCollectionItem } from '../../../runtime/collection/compound-logical-collection.svelte.js';
import type { SelectionKey } from '../../../runtime/collection/selection.js';

export interface RadioGroupLogicalItem extends CompoundLogicalCollectionItem<SelectionKey> {
	readonly label?: string;
}

export interface RadioGroupCollectionItem extends RadioGroupLogicalItem {
	readonly element: HTMLInputElement | null;
	readonly id: string;
}

export interface ZRadioGroupContext {
	readonly defaultValue?: SelectionKey;
	readonly disabled: boolean;
	readonly form?: string;
	readonly invalid: boolean;
	readonly name?: string;
	readonly readonly: boolean;
	readonly required: boolean;
	focus(value: SelectionKey): void;
	handleKey(event: KeyboardEvent): boolean;
	isSelected(value: SelectionKey): boolean;
	register(read: () => RadioGroupCollectionItem): () => void;
	restoreNativeSelection(): void;
	select(value: SelectionKey): boolean;
	tabIndex(value: SelectionKey): 0 | -1;
}

const RADIO_GROUP_CONTEXT = Symbol('zui-radio-group-context');

export function provideZRadioGroup(context: ZRadioGroupContext): ZRadioGroupContext {
	setContext(RADIO_GROUP_CONTEXT, context);
	return context;
}

export function useZRadioGroup(): ZRadioGroupContext {
	const context = getContext<ZRadioGroupContext | undefined>(RADIO_GROUP_CONTEXT);
	if (!context) throw new Error('ZRadioGroupItem must be rendered inside ZRadioGroup.');
	return context;
}
