import { getContext, setContext } from 'svelte';

import type { CompoundLogicalCollectionItem } from '../../../runtime/collection/compound-logical-collection.svelte.js';
import type { SelectionKey } from '../../../runtime/collection/selection.js';

export type AccordionType = 'multiple' | 'single';
export type AccordionSingleValue = SelectionKey | null;
export type AccordionMultipleValue = readonly SelectionKey[];
export type AccordionValue = AccordionMultipleValue | AccordionSingleValue;

export interface AccordionCollectionItem extends CompoundLogicalCollectionItem<SelectionKey> {
	readonly element: HTMLButtonElement | null;
	readonly id: string;
}

export interface ZAccordionContext {
	readonly disabled: boolean;
	readonly exitDuration: number;
	readonly owner: symbol;
	readonly reducedMotion: boolean;
	contentId(value: SelectionKey): string;
	focus(value: SelectionKey): void;
	handleKey(event: KeyboardEvent): boolean;
	isActive(value: SelectionKey): boolean;
	isOpen(value: SelectionKey): boolean;
	isTriggerLocked(value: SelectionKey): boolean;
	register(read: () => AccordionCollectionItem): () => void;
	restoreFocus(value: SelectionKey): void;
	tabIndex(value: SelectionKey): 0 | -1;
	toggle(value: SelectionKey): void;
	triggerId(value: SelectionKey): string;
}

export interface ZAccordionItemContext {
	readonly disabled: boolean;
	readonly owner: symbol;
	readonly value: SelectionKey;
}

const ACCORDION_CONTEXT = Symbol('zui-accordion-context');
const ACCORDION_ITEM_CONTEXT = Symbol('zui-accordion-item-context');

export function provideZAccordion(context: ZAccordionContext): ZAccordionContext {
	setContext(ACCORDION_CONTEXT, context);
	return context;
}

export function useZAccordion(): ZAccordionContext {
	const context = getContext<ZAccordionContext | undefined>(ACCORDION_CONTEXT);
	if (!context)
		throw new Error('ZAccordion compound components must be rendered inside ZAccordion.');
	return context;
}

export function provideZAccordionItem(context: ZAccordionItemContext): ZAccordionItemContext {
	setContext(ACCORDION_ITEM_CONTEXT, context);
	return context;
}

export function useZAccordionItem(owner?: symbol): ZAccordionItemContext {
	const context = getContext<ZAccordionItemContext | undefined>(ACCORDION_ITEM_CONTEXT);
	if (!context) throw new Error('ZAccordionTrigger and ZAccordionContent require ZAccordionItem.');
	if (owner !== undefined && context.owner !== owner) {
		throw new Error(
			'ZAccordionTrigger and ZAccordionContent require an Item owned by the nearest ZAccordion.'
		);
	}
	return context;
}
