import type { ComponentProps, Snippet } from 'svelte';

import ZDescriptionList, {
	type DescriptionItem,
	type ZDescriptionListProps
} from '../src/components/data-display/ZDescriptionList.svelte';
import ZList, { type ListItem, type ZListProps } from '../src/components/data-display/ZList.svelte';

const listItems = [
	{ key: 1, label: 'Number' },
	{ key: '1', label: 'String' }
] satisfies readonly ListItem[];
const descriptions = [
	{ key: 1, term: 'Number', description: 'One' },
	{ key: '1', term: 'String', description: 'One' }
] satisfies readonly DescriptionItem[];

const dataList = { items: listItems } satisfies ComponentProps<typeof ZList> satisfies ZListProps;
const manualList = {
	children: (() => undefined) as unknown as Snippet
} satisfies ComponentProps<typeof ZList> satisfies ZListProps;
const dataDescriptions = {
	items: descriptions
} satisfies ComponentProps<typeof ZDescriptionList> satisfies ZDescriptionListProps;
void dataList;
void manualList;
void dataDescriptions;

// @ts-expect-error a List requires exactly one of items or children.
const missingListSource = {} satisfies ComponentProps<typeof ZList>;
void missingListSource;

const ambiguousDescriptionSource = {
	children: (() => undefined) as unknown as Snippet,
	items: descriptions
};
// @ts-expect-error data and manual composition modes are mutually exclusive.
const ambiguousDescriptions: ComponentProps<typeof ZDescriptionList> = ambiguousDescriptionSource;
void ambiguousDescriptions;
