import { Time } from '@internationalized/date';
import type { ComponentProps } from 'svelte';

import ZTimeValue, {
	type TimeValueGranularity,
	type TimeValueSize,
	type ZTimeValueProps
} from '../src/components/data-display/ZTimeValue.svelte';
import ZTimeGrid, {
	type TimeGridFormParticipation,
	type TimeGridSize,
	type TimeGridSlot,
	type ZTimeGridProps
} from '../src/components/input/ZTimeGrid.svelte';

const slots = [
	{ label: 'Opening', value: new Time(8) },
	{ disabled: true, value: new Time(9, 30) }
] satisfies readonly TimeGridSlot[];
const grid = {
	allowDeselect: true,
	columns: 2,
	defaultValue: new Time(8),
	formParticipation: 'auto',
	granularity: 'minute',
	hourCycle: 24,
	size: 'large',
	slots,
	value: null
} satisfies ZTimeGridProps;
const componentGrid = {
	slots,
	value: new Time(8)
} satisfies ComponentProps<typeof ZTimeGrid>;
const display = {
	granularity: 'second',
	hourCycle: 12,
	lineHeight: 'compact',
	size: 'large',
	tabularNumbers: true,
	tone: 'primary',
	value: new Time(13, 5, 9),
	weight: 'semibold'
} satisfies ZTimeValueProps;
const componentDisplay = {
	value: new Time(8)
} satisfies ComponentProps<typeof ZTimeValue>;
const participation: TimeGridFormParticipation = 'none';
const gridSize: TimeGridSize = 'xlarge';
const valueSize: TimeValueSize = 'xxlarge';
const granularity: TimeValueGranularity = 'hour';

// @ts-expect-error Explicit slots accept only Time values, never strings.
const stringSlot: TimeGridSlot = { value: '08:00' };
// @ts-expect-error TimeValue requires a Time value.
const stringDisplay: ZTimeValueProps = { value: '08:00' };
// @ts-expect-error TimeGrid slots are required.
const missingSlots: ZTimeGridProps = { value: null };

void [
	grid,
	componentGrid,
	display,
	componentDisplay,
	participation,
	gridSize,
	valueSize,
	granularity,
	stringSlot,
	stringDisplay,
	missingSlots
];
