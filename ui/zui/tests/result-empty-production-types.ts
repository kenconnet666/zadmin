import type { ComponentProps } from 'svelte';

import ZEmpty, { type ZEmptyProps } from '../src/components/data-display/ZEmpty.svelte';
import ZResult, { type ZResultProps } from '../src/components/feedback/ZResult.svelte';

const resultProps = {
	'aria-label': 'Result region',
	contentAlign: 'start',
	headingLevel: 6,
	icon: null,
	title: 'Finished',
	tone: 'success'
} satisfies ComponentProps<typeof ZResult> satisfies ZResultProps;

const emptyProps = {
	'data-empty-kind': 'collection',
	headingLevel: 5,
	icon: null,
	title: 'No records'
} satisfies ComponentProps<typeof ZEmpty> satisfies ZEmptyProps;

// @ts-expect-error loading belongs to the collection/task owner, not Result
const invalidResult = { loading: true, title: 'Loading' } satisfies ZResultProps;
// @ts-expect-error loading belongs to the collection owner, not Empty
const invalidEmpty = { loading: true, title: 'Loading' } satisfies ZEmptyProps;

void resultProps;
void emptyProps;
void invalidResult;
void invalidEmpty;
