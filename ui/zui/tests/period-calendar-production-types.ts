import type { ComponentProps } from 'svelte';

import ZPeriodCalendar, {
	type PeriodCalendarCellContext,
	type PeriodCalendarHeaderContext,
	type PeriodCalendarOptions,
	type PeriodCalendarValue,
	type ZPeriodCalendarProps
} from '../src/components/input/ZPeriodCalendar.svelte';
import type { ZPeriodPickerProps } from '../src/components/input/ZPeriodPicker.svelte';
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
const componentMultipleProps = {
	granularity: 'quarter',
	selectionMode: 'multiple',
	value: [quarterPeriod(2026, 1)]
} satisfies ComponentProps<typeof ZPeriodCalendar>;
const componentRangeProps = {
	granularity: 'year',
	selectionMode: 'range',
	value: { end: yearPeriod(2027), start: yearPeriod(2026) }
} satisfies ComponentProps<typeof ZPeriodCalendar>;
declare const periodCell: NonNullable<ZPeriodCalendarProps<'month'>['periodCell']>;
declare const header: NonNullable<ZPeriodCalendarProps<'month'>['header']>;
const customized = {
	granularity: 'month',
	header,
	periodCell,
	value: monthPeriod(2026, 5)
} satisfies ZPeriodCalendarProps<'month'>;
const customizedPicker = {
	granularity: 'month',
	header,
	periodCell,
	value: monthPeriod(2026, 5)
} satisfies ZPeriodPickerProps<'month'>;
const cellContext: PeriodCalendarCellContext<'month'> = Object.freeze({
	current: true,
	direction: 'ltr',
	disabled: false,
	focused: true,
	label: 'May 2026',
	period: monthPeriod(2026, 5),
	preview: false,
	previewInvalid: false,
	readonly: false,
	selected: true,
	size: 'medium',
	unavailable: false,
	visibleLabel: 'May'
});
const headerContext: PeriodCalendarHeaderContext<'month'> = Object.freeze({
	direction: 'ltr',
	goToNextPage() {},
	goToPreviousPage() {},
	label: '2026',
	nextDisabled: false,
	previousDisabled: false,
	size: 'medium',
	visiblePeriods: Object.freeze([monthPeriod(2026, 5)])
});
// @ts-expect-error Period snippet contexts are readonly snapshots.
cellContext.focused = false;
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
	componentMultipleProps,
	componentRangeProps,
	customized,
	customizedPicker,
	cellContext,
	headerContext,
	selected,
	missingMode,
	wrongKind
];
