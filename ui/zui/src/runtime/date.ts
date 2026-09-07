import {
	type Calendar,
	CalendarDate,
	type CalendarDateTime,
	type CalendarIdentifier,
	DateFormatter,
	Time,
	type ZonedDateTime,
	createCalendar,
	getDayOfWeek,
	isSameMonth,
	startOfMonth,
	startOfWeek,
	toCalendar
} from '@internationalized/date';

export type Weekday = 'fri' | 'mon' | 'sat' | 'sun' | 'thu' | 'tue' | 'wed';
export type DateFieldSegment = 'day' | 'era' | 'month' | 'year';
export type TimeFieldGranularity = 'hour' | 'minute' | 'second';
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

export type SupportedDisplayCalendarIdentifier = (typeof supportedDisplayCalendars)[number];

export const supportedDisplayCalendars = Object.freeze([
	'buddhist',
	'coptic',
	'ethioaa',
	'ethiopic',
	'gregory',
	'hebrew',
	'indian',
	'iso8601',
	'islamic-civil',
	'islamic-tbla',
	'islamic-umalqura',
	'japanese',
	'persian',
	'roc'
] as const satisfies readonly CalendarIdentifier[]);

const supportedDisplayCalendarSet = new Set<string>(supportedDisplayCalendars);
type ImplementedDisplayCalendarIdentifier = Exclude<SupportedDisplayCalendarIdentifier, 'iso8601'>;

export type CalendarValue = CalendarDate | CalendarDateTime | ZonedDateTime;

export interface CalendarEraOption {
	readonly identifier: string;
	readonly label: string;
}

export function resolveDisplayCalendar(locale: string): Calendar {
	const requested = new Intl.Locale(locale).calendar;
	if (requested && !supportedDisplayCalendarSet.has(requested))
		throw new RangeError(
			`ZUI requested display calendar "${requested}" is not supported by @internationalized/date. ` +
				`Supported calendars: ${supportedDisplayCalendars.join(', ')}.`
		);
	const identifier = new Intl.DateTimeFormat(locale).resolvedOptions().calendar;
	if (!supportedDisplayCalendarSet.has(identifier))
		throw new RangeError(
			`ZUI display calendar "${identifier}" is not supported by @internationalized/date. ` +
				`Supported calendars: ${supportedDisplayCalendars.join(', ')}.`
		);
	const isoGregorianAlias = requested === 'iso8601' && identifier === 'gregory';
	if (requested && requested !== identifier && !isoGregorianAlias)
		throw new RangeError(
			`ZUI requested display calendar "${requested}", but Intl resolved "${identifier}" in this environment.`
		);
	// @internationalized/date does not expose a distinct ISO calendar class. ISO 8601 uses the
	// same era/year/month/day arithmetic as Gregorian; week-number policy remains a separate option.
	if (identifier === 'iso8601') return createCalendar('gregory');
	return createCalendar(identifier as ImplementedDisplayCalendarIdentifier);
}

export function resolveOwnerCalendar(
	...references: readonly (CalendarValue | null | undefined)[]
): Calendar {
	return (
		references.find((reference): reference is CalendarValue => reference != null)?.calendar ??
		createCalendar('gregory')
	);
}

export function toDisplayCalendar<TValue extends CalendarValue>(
	value: TValue,
	displayCalendar: Calendar
): TValue {
	return toCalendar(value, displayCalendar);
}

export function preserveCalendarOwner<TValue extends CalendarValue>(
	value: TValue,
	owner: Calendar | CalendarValue
): TValue {
	return toCalendar(value, 'calendar' in owner ? owner.calendar : owner);
}

/** Includes the owner calendar fields; CalendarDate.toString() intentionally erases them to ISO. */
export function calendarDateKey(value: CalendarDate | null | undefined): string {
	return value
		? `${value.calendar.identifier}:${value.era}:${value.year}-${value.month}-${value.day}`
		: '';
}

export function calendarEraOptions(
	reference: CalendarDate,
	locale: string,
	timeZone = 'UTC'
): readonly CalendarEraOption[] {
	const displayed = toDisplayCalendar(reference, resolveDisplayCalendar(locale));
	const formatter = new Intl.DateTimeFormat(locale, {
		day: 'numeric',
		era: 'short',
		month: 'numeric',
		timeZone,
		year: 'numeric'
	});
	return Object.freeze(
		displayed.calendar.getEras().map((identifier) => {
			let sample: CalendarDate | undefined;
			for (const [year, month, day] of [
				[2, 7, 1],
				[1, 7, 1],
				[1, 1, 1]
			] as const) {
				if (sample) break;
				try {
					const candidate = new CalendarDate(displayed.calendar, identifier, year, month, day);
					if (candidate.era === identifier) sample = candidate;
				} catch {
					// Try another stable point inside this era before falling back to its identifier.
				}
			}
			if (!sample && identifier === displayed.era) sample = displayed;
			const label =
				(sample
					? formatter.formatToParts(sample.toDate(timeZone)).find(({ type }) => type === 'era')
							?.value
					: undefined) ?? identifier;
			return Object.freeze({ identifier, label });
		})
	);
}

export function isCalendarDate(value: unknown): value is CalendarDate {
	return value instanceof CalendarDate && Object.getPrototypeOf(value) === CalendarDate.prototype;
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

export function isGregorianCalendarDate(value: unknown): value is CalendarDate {
	return (
		value instanceof CalendarDate &&
		Object.getPrototypeOf(value) === CalendarDate.prototype &&
		value.calendar.identifier === 'gregory'
	);
}

export function normalizeCalendarDateModelValue(
	value: unknown,
	owner: string
): CalendarDate | null {
	if (value === null || value === undefined) return null;
	if (!isCalendarDate(value))
		throw new TypeError(`${owner} model value must be a CalendarDate, null or undefined.`);
	return value;
}

export function normalizeTimeModelValue(value: unknown, owner: string): Time | null {
	if (value === null || value === undefined) return null;
	if (!(value instanceof Time) || Object.getPrototypeOf(value) !== Time.prototype)
		throw new TypeError(`${owner} model value must be a Time, null or undefined.`);
	return value;
}

export function normalizeCalendarRangeModelValue(
	value: unknown,
	owner: string
): CalendarRangeValue | null {
	if (value === null || value === undefined) return null;
	if (
		typeof value !== 'object' ||
		Object.getPrototypeOf(value) !== Object.prototype ||
		!Object.hasOwn(value, 'start') ||
		!Object.hasOwn(value, 'end')
	)
		throw new TypeError(
			`${owner} model value must be a CalendarDate range with nullable start and end, null or undefined.`
		);
	const range = value as { readonly end: unknown; readonly start: unknown };
	const start = normalizeCalendarDateModelValue(range.start, `${owner} start`);
	const end = normalizeCalendarDateModelValue(range.end, `${owner} end`);
	return normalizeRangeValue({ end, start });
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
			return Object.freeze({
				date,
				outsideMonth: !isSameMonth(date, month)
			});
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
	timeZone = 'UTC',
	reference?: CalendarDate
): readonly DateFieldPatternPart[] {
	const displayCalendar = resolveDisplayCalendar(locale);
	const sample = reference
		? toDisplayCalendar(reference, displayCalendar)
		: toDisplayCalendar(new CalendarDate(2006, 11, 22), displayCalendar);
	return Object.freeze(
		new Intl.DateTimeFormat(locale, {
			day: 'numeric',
			month: 'numeric',
			timeZone,
			year: 'numeric'
		})
			.formatToParts(sample.toDate(timeZone))
			.flatMap((part): DateFieldPatternPart[] => {
				switch (part.type) {
					case 'day':
					case 'era':
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
		minute: granularity === 'hour' ? undefined : '2-digit',
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
	return value.calendar.getDaysInMonth(value);
}

export function monthsInYear(value: CalendarDate): number {
	return value.calendar.getMonthsInYear(value);
}

export function minimumMonthInYear(value: CalendarDate): number {
	return value.calendar.getMinimumMonthInYear?.(value) ?? 1;
}

export function minimumDayInMonth(value: CalendarDate): number {
	return value.calendar.getMinimumDayInMonth?.(value) ?? 1;
}

export function weekDayIndex(
	value: CalendarDate,
	locale: string,
	firstDayOfWeek?: Weekday
): number {
	return getDayOfWeek(value, locale, firstDayOfWeek);
}
