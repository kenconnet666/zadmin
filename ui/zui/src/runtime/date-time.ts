import {
	CalendarDate,
	CalendarDateTime,
	Time,
	ZonedDateTime,
	toCalendarDateTime,
	toTime,
	toTimeZone,
	toZoned,
	type Disambiguation
} from '@internationalized/date';

export type DateTimeDisambiguation = Disambiguation;
export type DateTimeGranularity = 'hour' | 'minute' | 'second';
export type DateTimeMode = 'local' | 'zoned';

export type DateTimeValue<TMode extends DateTimeMode> = TMode extends 'zoned'
	? ZonedDateTime
	: CalendarDateTime;

export interface DateTimeParts {
	readonly date: CalendarDate;
	readonly time: Time;
}

export interface ComposeDateTimeOptions<TMode extends DateTimeMode> {
	readonly date: CalendarDate;
	readonly disambiguation?: DateTimeDisambiguation;
	readonly displayTimeZone: string;
	readonly mode: TMode;
	readonly ownerTimeZone?: string;
	readonly time: Time;
}

export function isGregorianCalendarDateTime(value: unknown): value is CalendarDateTime {
	return (
		value instanceof CalendarDateTime &&
		Object.getPrototypeOf(value) === CalendarDateTime.prototype &&
		value.calendar.identifier === 'gregory'
	);
}

export function isGregorianZonedDateTime(value: unknown): value is ZonedDateTime {
	return (
		value instanceof ZonedDateTime &&
		Object.getPrototypeOf(value) === ZonedDateTime.prototype &&
		value.calendar.identifier === 'gregory'
	);
}

export function normalizeDateTimeModelValue<TMode extends DateTimeMode>(
	value: unknown,
	mode: TMode,
	owner: string
): DateTimeValue<TMode> | null {
	if (value === null || value === undefined) return null;
	if (mode === 'zoned') {
		if (!isGregorianZonedDateTime(value))
			throw new TypeError(
				`${owner} model value must be a Gregorian ZonedDateTime, null or undefined in zoned mode.`
			);
		return value as DateTimeValue<TMode>;
	}
	if (!isGregorianCalendarDateTime(value))
		throw new TypeError(
			`${owner} model value must be a Gregorian CalendarDateTime, null or undefined in local mode.`
		);
	return value as DateTimeValue<TMode>;
}

export function displayDateTime<TMode extends DateTimeMode>(
	value: DateTimeValue<TMode>,
	mode: TMode,
	timeZone: string
): CalendarDateTime | ZonedDateTime {
	return mode === 'zoned' ? toTimeZone(value as ZonedDateTime, timeZone) : value;
}

export function dateTimeParts(value: CalendarDateTime | ZonedDateTime): DateTimeParts {
	return Object.freeze({
		date: new CalendarDate(value.calendar, value.era, value.year, value.month, value.day),
		time: toTime(value)
	});
}

export function composeDateTime<TMode extends DateTimeMode>(
	options: ComposeDateTimeOptions<TMode>
): DateTimeValue<TMode> {
	const local = toCalendarDateTime(options.date, options.time);
	if (!isGregorianCalendarDateTime(local))
		throw new TypeError('ZDateTimeField only supports Gregorian editing.');
	if (options.mode === 'local') return local as DateTimeValue<TMode>;
	const displayed = toZoned(local, options.displayTimeZone, options.disambiguation ?? 'compatible');
	return toTimeZone(
		displayed,
		options.ownerTimeZone ?? options.displayTimeZone
	) as DateTimeValue<TMode>;
}

export function compareDateTime(
	left: CalendarDateTime | ZonedDateTime,
	right: CalendarDateTime | ZonedDateTime
): number {
	return left.compare(right);
}

export function isDateTimeUnavailable<TValue extends CalendarDateTime | ZonedDateTime>(
	value: TValue,
	minValue?: TValue,
	maxValue?: TValue,
	isUnavailable?: (value: TValue) => boolean
): boolean {
	return Boolean(
		(minValue && compareDateTime(value, minValue) < 0) ||
		(maxValue && compareDateTime(value, maxValue) > 0) ||
		isUnavailable?.(value)
	);
}

export function dateTimeZoneLabel(value: ZonedDateTime, locale: string, timeZone: string): string {
	const part = new Intl.DateTimeFormat(locale, {
		hour: 'numeric',
		timeZone,
		timeZoneName: 'short'
	})
		.formatToParts(value.toDate())
		.find(({ type }) => type === 'timeZoneName');
	return part?.value ?? timeZone;
}
