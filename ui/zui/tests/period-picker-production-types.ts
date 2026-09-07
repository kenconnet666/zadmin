import type { ComponentProps } from 'svelte';

import ZPeriodPicker, {
	type ZPeriodPickerProps
} from '../src/components/input/ZPeriodPicker.svelte';
import { monthPeriod, quarterPeriod, weekPeriod, yearPeriod } from '../src/runtime/period.js';

const single = {
	commitMode: 'confirm',
	granularity: 'month',
	onCommit: (value) => value?.month,
	value: monthPeriod(2026, 5)
} satisfies ZPeriodPickerProps<'month'>;
const multiple = {
	fiscalYearStartMonth: 4,
	granularity: 'quarter',
	onCommit: (value) => value.map((period) => period.quarter),
	selectionMode: 'multiple',
	value: [quarterPeriod(2026, 1, 4)]
} satisfies ZPeriodPickerProps<'quarter', 'multiple'>;
const range = {
	granularity: 'week',
	onCommit: (value) => value?.end?.week,
	selectionMode: 'range',
	value: { end: null, start: weekPeriod(2026, 10) }
} satisfies ZPeriodPickerProps<'week', 'range'>;
const componentProps = {
	granularity: 'year',
	selectionMode: 'single',
	value: yearPeriod(2026)
} satisfies ComponentProps<typeof ZPeriodPicker>;
const componentMultipleProps = {
	granularity: 'quarter',
	selectionMode: 'multiple',
	value: [quarterPeriod(2026, 1)]
} satisfies ComponentProps<typeof ZPeriodPicker>;
const componentRangeProps = {
	granularity: 'week',
	selectionMode: 'range',
	value: { end: null, start: weekPeriod(2026, 10) }
} satisfies ComponentProps<typeof ZPeriodPicker>;
const missingModeCandidate = {
	granularity: 'month',
	value: [monthPeriod(2026, 5)]
} as const;
// @ts-expect-error Array values require the explicit multiple discriminator.
const missingMode: ZPeriodPickerProps = missingModeCandidate;
const wrongKind = {
	granularity: 'month',
	// @ts-expect-error The period kind must match Picker granularity.
	value: yearPeriod(2026)
} satisfies ZPeriodPickerProps<'month'>;
const wrongMode = {
	granularity: 'month',
	selectionMode: 'multiple',
	// @ts-expect-error Multiple mode requires an array value.
	value: monthPeriod(2026, 5)
} satisfies ZPeriodPickerProps<'month', 'multiple'>;

void [
	single,
	multiple,
	range,
	componentProps,
	componentMultipleProps,
	componentRangeProps,
	missingMode,
	wrongKind,
	wrongMode
];
