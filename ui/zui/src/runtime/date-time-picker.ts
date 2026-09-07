import {
	CalendarDate,
	CalendarDateTime,
	Time,
	ZonedDateTime,
	fromDate,
	toCalendarDateTime,
	toTime,
	toTimeZone,
	type Disambiguation
} from '@internationalized/date';

import {
	composeDateTime,
	dateTimeParts,
	displayDateTime,
	isDateTimeUnavailable,
	isGregorianCalendarDateTime,
	isGregorianZonedDateTime,
	type DateTimeMode
} from './date-time.js';
import type { Weekday } from './date.js';
import type { ZControlSize } from './foundation/control-size.js';
import { validateTimePickerConstraints, type TimePickerConstraints } from './time-picker.js';

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
		const valid =
			constraints.mode === 'zoned'
				? isGregorianZonedDateTime(value)
				: isGregorianCalendarDateTime(value);
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
	return mode === 'zoned' ? isGregorianZonedDateTime(value) : isGregorianCalendarDateTime(value);
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
	constraints: DateTimePickerConstraints
): DateTimePickerValue | null {
	validateDateTimePickerConstraints(constraints);
	const candidate: unknown = typeof preset.value === 'function' ? preset.value() : preset.value;
	return isDateTimePickerValue(candidate, constraints.mode) &&
		dateTimePickerValueAvailable(candidate, constraints)
		? candidate
		: null;
}

export function dateTimePickerNow(
	constraints: DateTimePickerConstraints,
	instant = new Date(),
	ownerTimeZone?: string
): DateTimePickerValue | null {
	const zoned = fromDate(instant, constraints.timeZone);
	const candidate: DateTimePickerValue =
		constraints.mode === 'zoned'
			? toTimeZone(zoned, ownerTimeZone ?? constraints.timeZone)
			: toCalendarDateTime(zoned);
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
		isTimeUnavailable: (time) => {
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

export function dateTimePickerParts(
	value: DateTimePickerValue,
	constraints: Pick<DateTimePickerConstraints, 'mode' | 'timeZone'>
): { readonly date: CalendarDate; readonly time: Time } {
	return dateTimeParts(dateTimePickerDisplayValue(value, constraints));
}
