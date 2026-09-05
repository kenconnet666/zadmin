import type { ComponentProps, Snippet } from 'svelte';

import ZStatistic, {
	type StatisticFormatter,
	type StatisticValue,
	type ZStatisticProps
} from '../src/components/data-display/ZStatistic.svelte';
import ZTimeline, {
	type TimelineItem,
	type ZTimelineProps
} from '../src/components/data-display/ZTimeline.svelte';

const prefix = (() => undefined) as unknown as Snippet;
const content = (() => undefined) as unknown as Snippet<[item: TimelineItem, index: number]>;
const formatter: StatisticFormatter = (value, { locale, options }) =>
	new Intl.NumberFormat(locale, options).format(value);

const statistic = {
	formatter,
	label: 'Revenue',
	locale: 'en-US',
	prefix,
	precision: 2,
	tone: 'primary',
	trend: 12.5,
	value: 1234.5
} satisfies ComponentProps<typeof ZStatistic> satisfies ZStatisticProps;
const timeline = {
	content,
	items: [
		{ key: 1, status: 'done', title: 'Number' },
		{ key: '1', status: 'current', title: 'String' }
	],
	mode: 'alternate',
	reverse: true
} satisfies ComponentProps<typeof ZTimeline> satisfies ZTimelineProps;
void statistic;
void timeline;

const bigint: StatisticValue = 12_345_678_901_234_567_890n;
void bigint;

// @ts-expect-error Timeline items require key identity.
const missingTimelineKey: TimelineItem = { title: 'Invalid' };
void missingTimelineKey;

// @ts-expect-error ZTimeline no longer accepts the removed item snippet alias.
const removedTimelineItemAlias = { item: content, items: [] } satisfies ZTimelineProps;
void removedTimelineItemAlias;

// @ts-expect-error Timeline status is a finite semantic union.
const invalidTimelineStatus: TimelineItem = { key: 'invalid', status: 'warning', title: 'Invalid' };
void invalidTimelineStatus;

// @ts-expect-error Statistic values are numeric and do not accept preformatted strings.
const invalidStatisticValue: StatisticValue = '1,234';
void invalidStatisticValue;

// @ts-expect-error formatter must return the final text string.
const invalidFormatter: StatisticFormatter = () => 42;
void invalidFormatter;
