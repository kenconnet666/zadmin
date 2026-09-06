import { getContext, setContext } from 'svelte';
import { createContextKey } from '../../../runtime/foundation/context-key.js';

import type { CompoundLogicalCollectionItem } from '../../../runtime/collection/compound-logical-collection.svelte.js';
import type { SelectionKey } from '../../../runtime/collection/selection.js';
import type { ZControlSize } from '../../../runtime/foundation/control-size.js';
import type { ZSemanticTone } from '../../../theme/semantics.js';
import type { CheckboxState } from '../../input/ZCheckbox.svelte';

export type CheckboxGroupTone = ZSemanticTone | 'primary';

export interface CheckboxGroupLogicalItem<
	TKey extends SelectionKey = SelectionKey
> extends CompoundLogicalCollectionItem<TKey> {
	readonly label?: string;
}

export interface CheckboxGroupCollectionItem<
	TKey extends SelectionKey = SelectionKey
> extends CheckboxGroupLogicalItem<TKey> {
	readonly element: HTMLInputElement | null;
	readonly id: string;
}

export interface ZCheckboxGroupContext<TKey extends SelectionKey = SelectionKey> {
	readonly defaultValue: readonly TKey[];
	readonly disabled: boolean;
	readonly form?: string;
	readonly invalid: boolean;
	readonly name?: string;
	readonly readonly: boolean;
	readonly size: ZControlSize;
	readonly tone: CheckboxGroupTone;
	defaultChecked(value: TKey): boolean;
	isNativeRequired(value: TKey, itemDisabled: boolean): boolean;
	isSelected(value: TKey): boolean;
	register(read: () => CheckboxGroupCollectionItem<TKey>): () => void;
	registerSelectAll(element: () => HTMLInputElement | null): () => void;
	restoreNativeSelection(): void;
	toggle(value: TKey): boolean;
	selectAllState(): CheckboxState;
	toggleAll(): boolean;
}

// The literal hot access enables Vite injection; provider and consumers retain their shared key.
const CHECKBOX_GROUP_CONTEXT = createContextKey(
	{ hot: import.meta.hot },
	'zui-checkbox-group-context'
);

export function provideZCheckboxGroup<TKey extends SelectionKey>(
	context: ZCheckboxGroupContext<TKey>
): ZCheckboxGroupContext<TKey> {
	setContext(CHECKBOX_GROUP_CONTEXT, context);
	return context;
}

export function useZCheckboxGroup<
	TKey extends SelectionKey = SelectionKey
>(): ZCheckboxGroupContext<TKey> {
	const context = getContext<ZCheckboxGroupContext<TKey> | undefined>(CHECKBOX_GROUP_CONTEXT);
	if (!context) throw new Error('ZCheckboxGroupItem must be rendered inside ZCheckboxGroup.');
	return context;
}
