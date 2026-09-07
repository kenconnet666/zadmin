import { fromDate, Time, toTime } from '@internationalized/date';

export type TimePickerGranularity = 'hour' | 'minute' | 'second';
export type TimePickerDayPeriod = 'am' | 'pm';
export type TimePickerPart = TimePickerGranularity | 'dayPeriod';
export type TimePickerPartValue = number | TimePickerDayPeriod;

export interface TimePickerConstraints {
	readonly granularity: TimePickerGranularity;
	readonly hourCycle: 12 | 24;
	readonly isTimeUnavailable?: (value: Time) => boolean;
	readonly maxValue?: Time;
	readonly minValue?: Time;
	readonly minuteStep: number;
	readonly secondStep: number;
}

export interface TimePickerPreset {
	readonly label: string;
	readonly value: Time | (() => Time);
}

export function validateTimePickerConstraints(constraints: TimePickerConstraints): void {
	if (
		![constraints.minuteStep, constraints.secondStep].every(
			(step) => Number.isInteger(step) && step > 0 && step < 60
		)
	)
		throw new TypeError('ZTimePicker steps must be positive integers below 60.');
	if (
		constraints.minValue &&
		constraints.maxValue &&
		constraints.minValue.compare(constraints.maxValue) > 0
	)
		throw new RangeError('ZTimePicker minValue cannot exceed maxValue.');
}

export function timePickerValueAvailable(
	value: Time,
	constraints: Pick<TimePickerConstraints, 'isTimeUnavailable' | 'maxValue' | 'minValue'>
): boolean {
	return !(
		(constraints.minValue && value.compare(constraints.minValue) < 0) ||
		(constraints.maxValue && value.compare(constraints.maxValue) > 0) ||
		constraints.isTimeUnavailable?.(value)
	);
}

export function resolveTimePickerPreset(
	preset: TimePickerPreset,
	constraints: TimePickerConstraints
): Time | null {
	validateTimePickerConstraints(constraints);
	const candidate: unknown = typeof preset.value === 'function' ? preset.value() : preset.value;
	return candidate instanceof Time &&
		Object.getPrototypeOf(candidate) === Time.prototype &&
		timePickerValueAvailable(candidate, constraints)
		? candidate
		: null;
}

export function timePickerNow(
	timeZone: string,
	constraints: TimePickerConstraints,
	instant = new Date()
): Time | null {
	validateTimePickerConstraints(constraints);
	const candidate = toTime(fromDate(instant, timeZone));
	return timePickerValueAvailable(candidate, constraints) ? candidate : null;
}

export function sameTimeValue(left: Time | null, right: Time | null): boolean {
	return left === right || (left !== null && right !== null && left.compare(right) === 0);
}

export function timePickerStepValues(step: number, current?: number): readonly number[] {
	const values = Array.from({ length: Math.ceil(60 / step) }, (_, index) => index * step).filter(
		(value) => value < 60
	);
	if (current !== undefined && !values.includes(current)) values.push(current);
	return Object.freeze(values.sort((left, right) => left - right));
}

interface FindAvailableTimeOptions extends TimePickerConstraints {
	readonly allowHiddenSearch?: boolean;
	readonly dayPeriod?: TimePickerDayPeriod;
	readonly fixedHour?: number;
	readonly fixedMinute?: number;
	readonly fixedSecond?: number;
	readonly preferred: Time;
}

function nearest(values: readonly number[], preferred: number): readonly number[] {
	return [...values].sort(
		(left, right) => Math.abs(left - preferred) - Math.abs(right - preferred) || left - right
	);
}

function fullUnit(): readonly number[] {
	return Array.from({ length: 60 }, (_, value) => value);
}

/**
 * Searches primitive axes and constructs only candidates that must be validated. It never builds
 * an all-day Time array. Hidden units are preserved for an existing value; an empty picker may
 * search them so precise min/max or availability rules still yield a reachable reference.
 */
export function findAvailableTime(options: FindAvailableTimeOptions): Time | null {
	validateTimePickerConstraints(options);
	const hours =
		options.fixedHour === undefined
			? Array.from({ length: 24 }, (_, hour) => hour).filter(
					(hour) =>
						options.dayPeriod === undefined || (options.dayPeriod === 'am' ? hour < 12 : hour >= 12)
				)
			: [options.fixedHour];
	const minuteVisible = options.granularity !== 'hour';
	const secondVisible = options.granularity === 'second';
	const minutes =
		options.fixedMinute !== undefined
			? [options.fixedMinute]
			: minuteVisible
				? timePickerStepValues(options.minuteStep, options.preferred.minute)
				: options.allowHiddenSearch
					? fullUnit()
					: [options.preferred.minute];
	const seconds =
		options.fixedSecond !== undefined
			? [options.fixedSecond]
			: secondVisible
				? timePickerStepValues(options.secondStep, options.preferred.second)
				: options.allowHiddenSearch
					? fullUnit()
					: [options.preferred.second];
	// Milliseconds are never rendered as a column. For an empty picker, sample the exact
	// min/max precision in addition to the preferred value so a narrow boundary interval remains
	// reachable without scanning all 1,000 hidden values.
	const milliseconds = options.allowHiddenSearch
		? [
				...new Set(
					[
						options.preferred.millisecond,
						options.minValue?.millisecond,
						options.maxValue?.millisecond
					].filter((value): value is number => value !== undefined)
				)
			]
		: [options.preferred.millisecond];
	for (const hour of nearest(hours, options.preferred.hour)) {
		for (const minute of nearest(minutes, options.preferred.minute)) {
			for (const second of nearest(seconds, options.preferred.second)) {
				for (const millisecond of nearest(milliseconds, options.preferred.millisecond)) {
					const candidate = new Time(hour, minute, second, millisecond);
					if (timePickerValueAvailable(candidate, options)) return candidate;
				}
			}
		}
	}
	return null;
}

export function initialTimePickerReference(
	value: Time | null,
	constraints: TimePickerConstraints,
	preferred = value ?? new Time(0)
): Time | null {
	validateTimePickerConstraints(constraints);
	if (value && timePickerValueAvailable(value, constraints)) return value;
	return findAvailableTime({
		...constraints,
		allowHiddenSearch: value === null,
		preferred
	});
}

/** Fixes the chosen column and searches only its downstream editable columns. */
export function selectTimePickerPart(
	reference: Time,
	part: TimePickerPart,
	value: TimePickerPartValue,
	constraints: TimePickerConstraints
): Time | null {
	const base: FindAvailableTimeOptions = { ...constraints, preferred: reference };
	switch (part) {
		case 'dayPeriod': {
			const dayPeriod = value as TimePickerDayPeriod;
			const hour = (reference.hour % 12) + (dayPeriod === 'pm' ? 12 : 0);
			return findAvailableTime({
				...base,
				dayPeriod,
				preferred: new Time(hour, reference.minute, reference.second, reference.millisecond)
			});
		}
		case 'hour': {
			const displayHour = value as number;
			const period = reference.hour < 12 ? 'am' : 'pm';
			const hour =
				constraints.hourCycle === 12
					? (displayHour % 12) + (period === 'pm' ? 12 : 0)
					: displayHour;
			return findAvailableTime({ ...base, fixedHour: hour });
		}
		case 'minute':
			return findAvailableTime({
				...base,
				fixedHour: reference.hour,
				fixedMinute: value as number
			});
		case 'second': {
			const candidate = new Time(
				reference.hour,
				reference.minute,
				value as number,
				reference.millisecond
			);
			return timePickerValueAvailable(candidate, constraints) ? candidate : null;
		}
	}
}
