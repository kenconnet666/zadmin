import { getContext, setContext } from 'svelte';

import type {
	CollectionItem,
	CollectionStore
} from '../../../runtime/collection/collection.svelte.js';
import type { NavigationOrientation } from '../../../runtime/collection/list-navigation.js';

export interface RadioGroupCollectionItem extends CollectionItem<string> {
	readonly textValue: string;
}

export interface ZRadioGroupContext {
	readonly collection: CollectionStore<RadioGroupCollectionItem>;
	readonly defaultValue?: string;
	readonly disabled: boolean;
	readonly form?: string;
	readonly invalid: boolean;
	readonly name?: string;
	readonly orientation: NavigationOrientation;
	readonly required: boolean;
	focus(value: string): void;
	handleKey(event: KeyboardEvent): void;
	isSelected(value: string): boolean;
	register(read: () => RadioGroupCollectionItem): () => void;
	select(value: string): void;
	tabIndex(value: string): 0 | -1;
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
