import type { ComponentProps } from 'svelte';

import ZPeriodCalendar, {
	type PeriodCalendarOptions,
	type PeriodCalendarValue,
	type ZPeriodCalendarProps
} from '../src/components/input/ZPeriodCalendar.svelte';
import { monthPeriod, quarterPeriod, weekPeriod, yearPeriod } from '../src/runtime/period.js';

const single = {
	granularity: 'month',
	value: monthPeriod(2026, 5)
} satisfies ZPeriodCalendarProps<'month'>;
const multiple = {
	fiscalYearStartMonth: 4,
	granularity: 'quarter',
	selectionMode: 'multiple',
	value: [quarterPeriod(2026, 1, 4), quarterPeriod(2026, 2, 4)]
} satisfies ZPeriodCalendarProps<'quarter', 'multiple'>;
const range = {
	allowEmpty: false,
	granularity: 'year',
	selectionMode: 'range',
	value: { end: yearPeriod(2027), start: yearPeriod(2025) }
} satisfies ZPeriodCalendarProps<'year', 'range'>;
const weeks = {
	granularity: 'week',
	selectionMode: 'multiple',
	showWeekNumbers: true,
	value: [weekPeriod(2026, 10, { firstDayOfWeek: 'sun', minimalDaysInFirstWeek: 1 })],
	weekRules: { firstDayOfWeek: 'sun', minimalDaysInFirstWeek: 1 }
} satisfies ZPeriodCalendarProps<'week', 'multiple'>;
const pickerOptions = {
	granularity: 'quarter',
	selectionMode: 'multiple',
	value: [quarterPeriod(2026, 1)]
} satisfies PeriodCalendarOptions<'quarter', 'multiple'>;
const componentProps = {
	granularity: 'month',
	selectionMode: 'single',
	value: null
} satisfies ComponentProps<typeof ZPeriodCalendar>;
const selected: PeriodCalendarValue<'month', 'multiple'> = [monthPeriod(2026, 1)];
const missingModeCandidate = {
	granularity: 'month',
	value: [monthPeriod(2026, 1)]
} as const;
// @ts-expect-error Multiple mode must be explicit so omission keeps the single branch.
const missingMode: ZPeriodCalendarProps<'month', 'multiple'> = missingModeCandidate;
const wrongKindCandidate = {
	granularity: 'month',
	value: yearPeriod(2026)
} as const;
// @ts-expect-error Value kind must match granularity.
const wrongKind: ZPeriodCalendarProps<'month'> = wrongKindCandidate;

void [
	single,
	multiple,
	range,
	weeks,
	pickerOptions,
	componentProps,
	selected,
	missingMode,
	wrongKind
];
