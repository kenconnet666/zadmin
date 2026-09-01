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
export type DateFieldSegment = 'day' | 'month' | 'year';
export type TimeFieldGranularity = 'minute' | 'second';
export type TimeFieldSegment = 'hour' | 'minute' | 'second';
export type TimeDayPeriod = 'am' | 'pm';

export type DateFieldPatternPart =
	Readonly<{ literal: string }> | Readonly<{ segment: DateFieldSegment }>;

export type TimeFieldPatternPart =
	| Readonly<{ dayPeriod: true }>
	| Readonly<{ literal: string }>
	| Readonly<{ segment: TimeFieldSegment }>;

export interface CalendarCell {
	readonly date: CalendarDate;
	readonly outsideMonth: boolean;
}

export interface CalendarRange {
	readonly end: CalendarDate;
	readonly start: CalendarDate;
}

/**
 * Public range value. A range may be empty or contain only a start while the
 * user is choosing the end. Field editing may also temporarily produce an
 * end-only value; only complete reversed ranges are reordered.
 */
export interface CalendarRangeValue {
	readonly end: CalendarDate | null;
	readonly start: CalendarDate | null;
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
	width: 'long' | 'narrow' | 'short' = 'short',
	timeZone = 'UTC'
): readonly string[] {
	const first = startOfWeek(startOfMonth(month), locale, firstDayOfWeek);
	const formatter = new DateFormatter(locale, { timeZone, weekday: width });
	return Object.freeze(
		Array.from({ length: 7 }, (_, index) =>
			formatter.format(first.add({ days: index }).toDate(timeZone))
		)
	);
}

export function formatDate(
	value: CalendarDate,
	locale: string,
	options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
	timeZone = 'UTC'
): string {
	return new DateFormatter(locale, { ...options, timeZone }).format(value.toDate(timeZone));
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

export function dateFieldPattern(
	locale: string,
	timeZone = 'UTC'
): readonly DateFieldPatternPart[] {
	return Object.freeze(
		new Intl.DateTimeFormat(locale, {
			day: 'numeric',
			month: 'numeric',
			timeZone,
			year: 'numeric'
		})
			.formatToParts(new CalendarDate(2006, 11, 22).toDate(timeZone))
			.flatMap((part): DateFieldPatternPart[] => {
				switch (part.type) {
					case 'day':
					case 'month':
					case 'year':
						return [Object.freeze({ segment: part.type })];
					case 'literal':
						return [Object.freeze({ literal: part.value })];
					default:
						return [];
				}
			})
	);
}

export function resolveHourCycle(locale: string, fallback: 12 | 24 = 24): 12 | 24 {
	try {
		const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle;
		return cycle === 'h11' || cycle === 'h12' ? 12 : 24;
	} catch {
		return fallback;
	}
}

export function timeFieldPattern(
	locale: string,
	hourCycle: 12 | 24,
	granularity: TimeFieldGranularity
): readonly TimeFieldPatternPart[] {
	const options: Intl.DateTimeFormatOptions = {
		hour: 'numeric',
		hourCycle: hourCycle === 12 ? 'h12' : 'h23',
		minute: '2-digit',
		second: granularity === 'second' ? '2-digit' : undefined,
		timeZone: 'UTC'
	};
	return Object.freeze(
		new Intl.DateTimeFormat(locale, options)
			.formatToParts(new Date(Date.UTC(2006, 10, 22, 13, 45, 37)))
			.flatMap((part): TimeFieldPatternPart[] => {
				switch (part.type) {
					case 'hour':
					case 'minute':
					case 'second':
						return [Object.freeze({ segment: part.type })];
					case 'dayPeriod':
						return [Object.freeze({ dayPeriod: true })];
					case 'literal':
						return [Object.freeze({ literal: part.value })];
					default:
						return [];
				}
			})
	);
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

export function normalizeRangeValue(
	value: CalendarRangeValue | CalendarRange | null | undefined
): CalendarRangeValue | null {
	if (!value) return null;
	const { end, start } = value;
	if (!start && !end) return null;
	if (!start || !end) return Object.freeze({ end, start });
	return normalizeRange(start, end);
}

export function isDateInRange(
	value: CalendarDate,
	range?: CalendarRangeValue | CalendarRange | null
): boolean {
	const normalized = normalizeRangeValue(range);
	if (!normalized) return false;
	if (!normalized.start) return Boolean(normalized.end && value.compare(normalized.end) === 0);
	if (!normalized.end) return value.compare(normalized.start) === 0;
	return value.compare(normalized.start) >= 0 && value.compare(normalized.end) <= 0;
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
