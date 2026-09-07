import { startOfMonth, startOfWeek, type CalendarDate } from '@internationalized/date';
import type { Weekday } from './date.js';

export type CalendarView = 'month' | 'strip';
export interface CalendarMonthViewOptions {
	readonly view?: 'month';
	readonly visibleMonths?: number;
	readonly visibleDays?: never;
}
export interface CalendarStripViewOptions {
	readonly view: 'strip';
	readonly visibleDays?: number;
	readonly visibleMonths?: never;
}

export function validateCalendarView(value: CalendarView): CalendarView {
	if (value !== 'month' && value !== 'strip')
		throw new TypeError("Calendar view must be 'month' or 'strip'.");
	return value;
}

export function validateVisibleDays(value: number): number {
	if (!Number.isInteger(value) || value < 1 || value > 31)
		throw new RangeError('Calendar visibleDays must be an integer from 1 through 31.');
	return value;
}

/** A compact window uses the same immutable date arithmetic as the month calendar. */
export function calendarStripStart(
	date: CalendarDate,
	locale: string,
	firstDayOfWeek?: Weekday
): CalendarDate {
	return startOfWeek(date, locale, firstDayOfWeek);
}

export function visibleCalendarDates(start: CalendarDate, count: number): readonly CalendarDate[] {
	validateVisibleDays(count);
	const dates: CalendarDate[] = [start];
	while (dates.length < count) {
		const current = dates[dates.length - 1]!;
		const next = current.add({ days: 1 });
		if (next.compare(current) <= 0) break;
		dates.push(next);
	}
	return Object.freeze(dates);
}

export function calendarMonthsInWindow(dates: readonly CalendarDate[]): readonly CalendarDate[] {
	const months = new Map<string, CalendarDate>();
	for (const date of dates) {
		const month = startOfMonth(date);
		months.set(month.toString(), month);
	}
	return Object.freeze([...months.values()]);
}
