import {
	CalendarDate,
	DateFormatter,
	endOfMonth,
	getDayOfWeek,
	startOfMonth,
	startOfWeek,
	type Time
} from '@internationalized/date';

export type Weekday = 'fri' | 'mon' | 'sat' | 'sun' | 'thu' | 'tue' | 'wed';

export interface CalendarCell {
	readonly date: CalendarDate;
	readonly outsideMonth: boolean;
}

export interface CalendarRange {
	readonly end: CalendarDate;
	readonly start: CalendarDate;
}

export function calendarMonth(
	month: CalendarDate,
	locale: string,
	firstDayOfWeek?: Weekday
): readonly CalendarCell[] {
	const first = startOfWeek(startOfMonth(month), locale, firstDayOfWeek);
	return Object.freeze(
		Array.from({ length: 42 }, (_, index) => {
			const date = first.add({ days: index });
			return Object.freeze({ date, outsideMonth: date.month !== month.month });
		})
	);
}

export function weekdayLabels(
	month: CalendarDate,
	locale: string,
	firstDayOfWeek?: Weekday,
	width: 'long' | 'narrow' | 'short' = 'short'
): readonly string[] {
	const first = startOfWeek(startOfMonth(month), locale, firstDayOfWeek);
	const formatter = new DateFormatter(locale, { timeZone: 'UTC', weekday: width });
	return Object.freeze(
		Array.from({ length: 7 }, (_, index) =>
			formatter.format(first.add({ days: index }).toDate('UTC'))
		)
	);
}

export function formatDate(
	value: CalendarDate,
	locale: string,
	options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
): string {
	return new DateFormatter(locale, { ...options, timeZone: 'UTC' }).format(value.toDate('UTC'));
}

export function formatTime(
	value: Time,
	locale: string,
	options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
): string {
	const date = new Date(
		Date.UTC(1970, 0, 1, value.hour, value.minute, value.second, value.millisecond)
	);
	return new DateFormatter(locale, { ...options, timeZone: 'UTC' }).format(date);
}

export function clampDate(
	value: CalendarDate,
	min?: CalendarDate,
	max?: CalendarDate
): CalendarDate {
	if (min && value.compare(min) < 0) return min;
	if (max && value.compare(max) > 0) return max;
	return value;
}

export function isDateUnavailable(
	value: CalendarDate,
	min?: CalendarDate,
	max?: CalendarDate,
	isDisabled?: (date: CalendarDate) => boolean
): boolean {
	return Boolean(
		(min && value.compare(min) < 0) || (max && value.compare(max) > 0) || isDisabled?.(value)
	);
}

export function normalizeRange(first: CalendarDate, second: CalendarDate): CalendarRange {
	return first.compare(second) <= 0
		? Object.freeze({ end: second, start: first })
		: Object.freeze({ end: first, start: second });
}

export function isDateInRange(value: CalendarDate, range?: CalendarRange): boolean {
	return Boolean(range && value.compare(range.start) >= 0 && value.compare(range.end) <= 0);
}

export function daysInMonth(value: CalendarDate): number {
	return endOfMonth(value).day;
}

export function weekDayIndex(
	value: CalendarDate,
	locale: string,
	firstDayOfWeek?: Weekday
): number {
	return getDayOfWeek(value, locale, firstDayOfWeek);
}
