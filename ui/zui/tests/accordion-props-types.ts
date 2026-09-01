import type { ComponentProps } from 'svelte';

import {
	ZAccordion,
	type AccordionMultipleValue,
	type AccordionSingleValue,
	type AccordionType,
	type AccordionValue,
	type ZAccordionMultipleProps,
	type ZAccordionProps,
	type ZAccordionSingleProps
} from '../src/entrypoints/index.js';

declare const runtimeType: AccordionType;
declare const runtimeValue: AccordionValue;

const flatProps = {
	type: runtimeType,
	value: runtimeValue,
	onValueChange(value) {
		const next: AccordionValue = value;
		void next;
	}
} satisfies ComponentProps<typeof ZAccordion> satisfies ZAccordionProps;

const singleProps = {
	collapsible: false,
	defaultValue: 'details',
	onValueChange(value) {
		const next: AccordionSingleValue = value;
		void next;
	},
	type: 'single'
} satisfies ZAccordionSingleProps;

const multipleProps = {
	defaultValue: ['build'],
	onValueChange(value) {
		const next: AccordionMultipleValue = value;
		void next;
	},
	type: 'multiple'
} satisfies ZAccordionMultipleProps;

const singleAsComponent: ComponentProps<typeof ZAccordion> = singleProps;
const multipleAsComponent: ComponentProps<typeof ZAccordion> = multipleProps;

const invalidMultipleCollapsible = {
	// @ts-expect-error collapsible belongs to the strict single helper
	collapsible: true,
	type: 'multiple'
} satisfies ZAccordionMultipleProps;

const invalidMultipleValue = {
	// @ts-expect-error multiple helper requires a readonly key array
	defaultValue: 'build',
	type: 'multiple'
} satisfies ZAccordionMultipleProps;

const invalidSingleValue = {
	// @ts-expect-error single helper rejects arrays
	value: ['build'],
	type: 'single'
} satisfies ZAccordionSingleProps;

void flatProps;
void singleAsComponent;
void multipleAsComponent;
void invalidMultipleCollapsible;
void invalidMultipleValue;
void invalidSingleValue;
