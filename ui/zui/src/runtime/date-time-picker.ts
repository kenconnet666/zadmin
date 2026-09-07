import {
	CalendarDate,
	CalendarDateTime,
	Time,
	ZonedDateTime,
	fromDate,
	toCalendar,
	toCalendarDateTime,
	toTime,
	toTimeZone,
	type Disambiguation
} from '@internationalized/date';

import {
	composeDateTime,
	dateTimeParts,
	displayDateTime,
	isCalendarDateTime,
	isDateTimeUnavailable,
	isZonedDateTime,
	type DateTimeMode
} from './date-time.js';
import type { Weekday } from './date.js';
import type { ZControlSize } from './foundation/control-size.js';
import {
	initialTimePickerReference,
	validateTimePickerConstraints,
	type TimePickerConstraints
} from './time-picker.js';

export type DateTimePickerDirection = 'auto' | 'ltr' | 'rtl';
export type DateTimePickerValue = CalendarDateTime | ZonedDateTime;

export interface DateTimePickerPreset {
	readonly label: string;
	readonly value: DateTimePickerValue | (() => DateTimePickerValue);
}

export interface DateTimePickerConstraints {
	readonly disambiguation: Disambiguation;
	readonly granularity: 'hour' | 'minute' | 'second';
	readonly hourCycle: 12 | 24;
	readonly isDateTimeUnavailable?: (value: DateTimePickerValue) => boolean;
	readonly maxValue?: DateTimePickerValue;
	readonly minValue?: DateTimePickerValue;
	readonly minuteStep: number;
	readonly mode: DateTimeMode;
	readonly secondStep: number;
	readonly timeZone: string;
}

export interface DateTimePickerPanelSharedProps extends DateTimePickerConstraints {
	readonly calendarLabel: string;
	readonly cancelLabel?: string;
	readonly confirmLabel: string;
	readonly direction: DateTimePickerDirection;
	readonly disabled: boolean;
	readonly firstDayOfWeek?: Weekday;
	readonly invalidDateTimeLabel: string;
	readonly locale: string;
	readonly nextLabel: string;
	readonly noAvailableTimeLabel: string;
	readonly nowLabel: string;
	readonly presets?: readonly DateTimePickerPreset[];
	readonly previousLabel: string;
	readonly readonly?: boolean;
	readonly showNow?: boolean;
	readonly showOutsideDates?: boolean;
	readonly size: ZControlSize;
}

export interface DateTimePickerCalendarBounds {
	readonly maxValue?: CalendarDate;
	readonly minValue?: CalendarDate;
}

export function validateDateTimePickerConstraints(constraints: DateTimePickerConstraints): void {
	validateTimePickerConstraints({
		granularity: constraints.granularity,
		hourCycle: constraints.hourCycle,
		minuteStep: constraints.minuteStep,
		secondStep: constraints.secondStep
	});
	for (const [name, value] of [
		['minValue', constraints.minValue],
		['maxValue', constraints.maxValue]
	] as const) {
		if (value === undefined) continue;
		const valid = constraints.mode === 'zoned' ? isZonedDateTime(value) : isCalendarDateTime(value);
		if (!valid)
			throw new TypeError(
				`DateTimePickerPanel ${name} must match its ${constraints.mode} value mode.`
			);
	}
	if (
		constraints.minValue &&
		constraints.maxValue &&
		constraints.minValue.compare(constraints.maxValue) > 0
	)
		throw new RangeError('DateTimePickerPanel minValue cannot exceed maxValue.');
}

export function sameDateTimePickerValue(
	left: DateTimePickerValue | null,
	right: DateTimePickerValue | null
): boolean {
	if (left === right) return true;
	if (!left || !right || Object.getPrototypeOf(left) !== Object.getPrototypeOf(right)) return false;
	if (left.calendar.identifier !== right.calendar.identifier || left.era !== right.era)
		return false;
	if (left instanceof ZonedDateTime && right instanceof ZonedDateTime)
		return (
			left.compare(right) === 0 && left.timeZone === right.timeZone && left.offset === right.offset
		);
	return left.compare(right) === 0;
}

export function isDateTimePickerValue(
	value: unknown,
	mode: DateTimeMode
): value is DateTimePickerValue {
	return mode === 'zoned' ? isZonedDateTime(value) : isCalendarDateTime(value);
}

export function dateTimePickerDisplayValue(
	value: DateTimePickerValue,
	constraints: Pick<DateTimePickerConstraints, 'mode' | 'timeZone'>
): CalendarDateTime | ZonedDateTime {
	return displayDateTime(value, constraints.mode, constraints.timeZone);
}

export function dateTimePickerCalendarBounds(
	constraints: DateTimePickerConstraints
): DateTimePickerCalendarBounds {
	validateDateTimePickerConstraints(constraints);
	return Object.freeze({
		maxValue: constraints.maxValue
			? dateTimeParts(dateTimePickerDisplayValue(constraints.maxValue, constraints)).date
			: undefined,
		minValue: constraints.minValue
			? dateTimeParts(dateTimePickerDisplayValue(constraints.minValue, constraints)).date
			: undefined
	});
}

/**
 * Calendar cells only reject dates proven outside the displayed min/max domain. An arbitrary
 * joint predicate is intentionally not scanned across every second of every visible day.
 */
export function dateTimePickerDateUnavailable(
	date: CalendarDate,
	constraints: DateTimePickerConstraints
): boolean {
	const bounds = dateTimePickerCalendarBounds(constraints);
	return Boolean(
		(bounds.minValue && date.compare(bounds.minValue) < 0) ||
		(bounds.maxValue && date.compare(bounds.maxValue) > 0)
	);
}

export function composeDateTimePickerCandidate(
	date: CalendarDate,
	time: Time,
	reference: DateTimePickerValue,
	constraints: DateTimePickerConstraints
): DateTimePickerValue | null {
	validateDateTimePickerConstraints(constraints);
	if (!isDateTimePickerValue(reference, constraints.mode))
		throw new TypeError('DateTimePickerPanel reference must match its value mode.');
	return composeDateTimePickerCandidateUnchecked(date, time, reference, constraints);
}

function composeDateTimePickerCandidateUnchecked(
	date: CalendarDate,
	time: Time,
	reference: DateTimePickerValue,
	constraints: DateTimePickerConstraints,
	referenceParts = dateTimePickerParts(reference, constraints)
): DateTimePickerValue | null {
	// An existing offset already resolves a DST fold. A no-op must preserve that exact instant.
	if (date.compare(referenceParts.date) === 0 && time.compare(referenceParts.time) === 0)
		return reference;
	try {
		return composeDateTime({
			date,
			disambiguation: constraints.disambiguation,
			displayTimeZone: constraints.timeZone,
			mode: constraints.mode,
			ownerTimeZone: reference instanceof ZonedDateTime ? reference.timeZone : undefined,
			time
		});
	} catch (error) {
		if (constraints.disambiguation === 'reject' && error instanceof RangeError) return null;
		throw error;
	}
}

export function dateTimePickerValueAvailable(
	value: DateTimePickerValue,
	constraints: DateTimePickerConstraints
): boolean {
	validateDateTimePickerConstraints(constraints);
	return dateTimePickerValueAvailableUnchecked(value, constraints);
}

function dateTimePickerValueAvailableUnchecked(
	value: DateTimePickerValue,
	constraints: DateTimePickerConstraints
): boolean {
	return (
		isDateTimePickerValue(value, constraints.mode) &&
		!isDateTimeUnavailable(
			value,
			constraints.minValue,
			constraints.maxValue,
			constraints.isDateTimeUnavailable
		)
	);
}

export function resolveDateTimePickerPreset(
	preset: DateTimePickerPreset,
	constraints: DateTimePickerConstraints,
	reference?: DateTimePickerValue
): DateTimePickerValue | null {
	validateDateTimePickerConstraints(constraints);
	const candidate: unknown = typeof preset.value === 'function' ? preset.value() : preset.value;
	if (!isDateTimePickerValue(candidate, constraints.mode)) return null;
	if (reference && !isDateTimePickerValue(reference, constraints.mode))
		throw new TypeError('DateTimePickerPanel preset reference must match its value mode.');
	let owned = reference ? toCalendar(candidate, reference.calendar) : candidate;
	if (owned instanceof ZonedDateTime && reference instanceof ZonedDateTime)
		owned = toTimeZone(owned, reference.timeZone);
	return dateTimePickerValueAvailable(owned, constraints) ? owned : null;
}

export function dateTimePickerNow(
	constraints: DateTimePickerConstraints,
	instant = new Date(),
	reference?: DateTimePickerValue
): DateTimePickerValue | null {
	validateDateTimePickerConstraints(constraints);
	if (reference && !isDateTimePickerValue(reference, constraints.mode))
		throw new TypeError('DateTimePickerPanel Now reference must match its value mode.');
	const zoned = fromDate(instant, constraints.timeZone);
	const displayed = reference ? toCalendar(zoned, reference.calendar) : zoned;
	const candidate: DateTimePickerValue =
		constraints.mode === 'zoned'
			? toTimeZone(
					displayed,
					reference instanceof ZonedDateTime ? reference.timeZone : constraints.timeZone
				)
			: toCalendarDateTime(displayed);
	return dateTimePickerValueAvailable(candidate, constraints) ? candidate : null;
}

export function dateTimePickerTimeConstraints(
	date: CalendarDate,
	reference: DateTimePickerValue,
	constraints: DateTimePickerConstraints
): TimePickerConstraints {
	validateDateTimePickerConstraints(constraints);
	if (!isDateTimePickerValue(reference, constraints.mode))
		throw new TypeError('DateTimePickerPanel reference must match its value mode.');
	const referenceParts = dateTimePickerParts(reference, constraints);
	return Object.freeze({
		granularity: constraints.granularity,
		hourCycle: constraints.hourCycle,
		isTimeUnavailable: (time: Time) => {
			const candidate = composeDateTimePickerCandidateUnchecked(
				date,
				time,
				reference,
				constraints,
				referenceParts
			);
			return !candidate || !dateTimePickerValueAvailableUnchecked(candidate, constraints);
		},
		minuteStep: constraints.minuteStep,
		secondStep: constraints.secondStep
	});
}

/**
 * Resolves the time shown by an empty date-time panel for one concrete day. It preserves the
 * placeholder precision when available and otherwise searches hidden units as well, which keeps
 * a boundary day reachable when the configured granularity does not render minutes or seconds.
 */
export function initialDateTimePickerTime(
	date: CalendarDate,
	reference: DateTimePickerValue,
	constraints: DateTimePickerConstraints
): Time | null {
	const parts = dateTimePickerParts(reference, constraints);
	const timeConstraints = dateTimePickerTimeConstraints(date, reference, constraints);
	// These are search candidates, not Time min/max. Around a DST fold, wall-clock order can differ
	// from instant order; the composed DateTime predicate remains the only availability authority.
	const boundaryMilliseconds = [constraints.minValue, constraints.maxValue].flatMap((boundary) => {
		if (!boundary) return [];
		const boundaryParts = dateTimePickerParts(boundary, constraints);
		return boundaryParts.date.compare(date) === 0 ? [boundaryParts.time.millisecond] : [];
	});
	return initialTimePickerReference(null, timeConstraints, parts.time, boundaryMilliseconds);
}

export function dateTimePickerParts(
	value: DateTimePickerValue,
	constraints: Pick<DateTimePickerConstraints, 'mode' | 'timeZone'>
): { readonly date: CalendarDate; readonly time: Time } {
	return dateTimeParts(dateTimePickerDisplayValue(value, constraints));
}
