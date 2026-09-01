import { getContext, setContext } from 'svelte';

import type {
	CollectionItem,
	CollectionStore
} from '../../../runtime/collection/collection.svelte.js';

export type AccordionType = 'multiple' | 'single';
export type AccordionValue = string | readonly string[];

export interface AccordionCollectionItem extends CollectionItem<string> {
	readonly textValue: string;
}

export interface ZAccordionContext {
	readonly collection: CollectionStore<AccordionCollectionItem>;
	readonly disabled: boolean;
	readonly exitDuration: number;
	readonly reducedMotion: boolean;
	contentId(value: string): string;
	focus(value: string): void;
	handleKey(event: KeyboardEvent): void;
	isOpen(value: string): boolean;
	register(read: () => AccordionCollectionItem): () => void;
	tabIndex(value: string): 0 | -1;
	toggle(value: string): void;
	triggerId(value: string): string;
}

export interface ZAccordionItemContext {
	readonly disabled: boolean;
	readonly value: string;
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

export function useZAccordionItem(): ZAccordionItemContext {
	const context = getContext<ZAccordionItemContext | undefined>(ACCORDION_ITEM_CONTEXT);
	if (!context) throw new Error('ZAccordionTrigger and ZAccordionContent require ZAccordionItem.');
	return context;
}
