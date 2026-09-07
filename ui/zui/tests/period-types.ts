import type {
	MonthPeriod,
	PeriodOfKind,
	PeriodRangeValue,
	PeriodSelectionValue,
	QuarterPeriod,
	WeekPeriod
} from '../src/runtime/period.js';
import {
	monthPeriod,
	normalizePeriodSelection,
	periodFromDate,
	quarterPeriod,
	weekPeriod
} from '../src/runtime/period.js';

const month: PeriodOfKind<'month'> = monthPeriod(2026, 9);
const quarter: QuarterPeriod = quarterPeriod(2026, 3, 4);
const week: WeekPeriod = weekPeriod(2020, 53);
const derivedWeek: WeekPeriod = periodFromDate(new CalendarDate(2021, 1, 1), {
	kind: 'week'
});
const multiple: PeriodSelectionValue<'month', 'multiple'> = normalizePeriodSelection(
	'multiple',
	[month, month],
	'month'
);
const range: PeriodSelectionValue<'month', 'range'> = normalizePeriodSelection(
	'range',
	{ end: monthPeriod(2026, 9), start: monthPeriod(2026, 8) },
	'month'
);
const explicitRange: PeriodRangeValue<'month'> = { end: month, start: null };
// @ts-expect-error MonthPeriod has no fiscal-quarter identity.
const wrongQuarter: QuarterPeriod = month;
// @ts-expect-error Week firstDayOfWeek is the closed Weekday union.
const wrongWeek: WeekPeriod = { ...week, firstDayOfWeek: 'monday' };
// @ts-expect-error Multiple month selection cannot contain a quarter.
const wrongMultiple: readonly MonthPeriod[] = [quarter];
// @ts-expect-error Week rules use the same object shape as PeriodCalendar; positional rules are unsupported.
const wrongPositionalWeek = weekPeriod(2026, 1, 'sun');

void [
	month,
	quarter,
	week,
	derivedWeek,
	multiple,
	range,
	explicitRange,
	wrongQuarter,
	wrongWeek,
	wrongMultiple,
	wrongPositionalWeek
];
import { CalendarDate } from '@internationalized/date';
