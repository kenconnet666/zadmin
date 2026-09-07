import { Time } from '@internationalized/date';

export type TimeRangePart = 'start' | 'end';
export type TimeRangeMode = 'ordered' | 'overnight';

export interface TimeRangeValue {
	readonly end: Time | null;
	readonly start: Time | null;
}

export interface TimeRange {
	readonly end: Time;
	readonly start: Time;
}

export interface TimeRangePickerPreset {
	readonly label: string;
	readonly value: TimeRangeValue | (() => TimeRangeValue);
}

export interface TimeRangeConstraints {
	readonly allowEmpty: boolean;
	readonly isTimeUnavailable?: (value: Time, part: TimeRangePart, range: TimeRangeValue) => boolean;
	readonly maxValue?: Time;
	readonly minValue?: Time;
	readonly rangeMode: TimeRangeMode;
}

export type TimeRangeInvalidReason = 'end-unavailable' | 'order' | 'partial' | 'start-unavailable';

export interface TimeRangeValidation {
	readonly reason?: TimeRangeInvalidReason;
	readonly valid: boolean;
}

function normalizeEndpoint(value: unknown, owner: string): Time | null {
	if (value === null || value === undefined) return null;
	if (!(value instanceof Time) || Object.getPrototypeOf(value) !== Time.prototype)
		throw new TypeError(`${owner} must be a Time, null or undefined.`);
	return value;
}

/**
 * Preserves endpoint order and partial values. In particular, it never swaps a reversed complete
 * range: `rangeMode` determines whether that range is invalid or explicitly crosses midnight.
 */
export function normalizeTimeRangeModelValue(
	value: unknown,
	owner = 'ZTimeRangePicker'
): TimeRangeValue | null {
	if (value === null || value === undefined) return null;
	if (
		typeof value !== 'object' ||
		Object.getPrototypeOf(value) !== Object.prototype ||
		!Object.hasOwn(value, 'start') ||
		!Object.hasOwn(value, 'end')
	)
		throw new TypeError(
			`${owner} model value must be a Time range with nullable start and end, null or undefined.`
		);
	const range = value as { readonly end: unknown; readonly start: unknown };
	const start = normalizeEndpoint(range.start, `${owner} start`);
	const end = normalizeEndpoint(range.end, `${owner} end`);
	return start === null && end === null ? null : Object.freeze({ end, start });
}

export function timeRangeValue(
	start: Time | null | undefined,
	end: Time | null | undefined
): TimeRangeValue | null {
	return start === null || start === undefined
		? end === null || end === undefined
			? null
			: Object.freeze({ end, start: null })
		: Object.freeze({ end: end ?? null, start });
}

export function sameTimeRangeValue(
	left: TimeRangeValue | null,
	right: TimeRangeValue | null
): boolean {
	return (
		left === right ||
		(left !== null &&
			right !== null &&
			(left.start === right.start ||
				(left.start !== null && right.start !== null && left.start.compare(right.start) === 0)) &&
			(left.end === right.end ||
				(left.end !== null && right.end !== null && left.end.compare(right.end) === 0)))
	);
}

export function replaceTimeRangePart(
	range: TimeRangeValue | null,
	part: TimeRangePart,
	value: Time | null
): TimeRangeValue | null {
	return part === 'start' ? timeRangeValue(value, range?.end) : timeRangeValue(range?.start, value);
}

export function validateTimeRangeConstraints(constraints: TimeRangeConstraints): void {
	if (constraints.rangeMode !== 'ordered' && constraints.rangeMode !== 'overnight')
		throw new TypeError("ZTimeRangePicker rangeMode must be 'ordered' or 'overnight'.");
	if (
		constraints.minValue &&
		constraints.maxValue &&
		constraints.minValue.compare(constraints.maxValue) > 0
	)
		throw new RangeError('ZTimeRangePicker minValue cannot exceed maxValue.');
}

export function timeRangeEndpointAvailable(
	value: Time,
	part: TimeRangePart,
	range: TimeRangeValue | null,
	constraints: TimeRangeConstraints
): boolean {
	validateTimeRangeConstraints(constraints);
	const candidate = replaceTimeRangePart(range, part, value) ?? { end: null, start: null };
	if (
		(constraints.minValue && value.compare(constraints.minValue) < 0) ||
		(constraints.maxValue && value.compare(constraints.maxValue) > 0) ||
		constraints.isTimeUnavailable?.(value, part, candidate)
	)
		return false;
	return !(
		constraints.rangeMode === 'ordered' &&
		candidate.start &&
		candidate.end &&
		candidate.start.compare(candidate.end) > 0
	);
}

export function validateTimeRangeValue(
	value: TimeRangeValue | null,
	constraints: TimeRangeConstraints
): TimeRangeValidation {
	validateTimeRangeConstraints(constraints);
	if (!value) return Object.freeze({ valid: true });
	if (!value.start || !value.end) {
		if (!constraints.allowEmpty) return Object.freeze({ reason: 'partial', valid: false });
		const part: TimeRangePart = value.start ? 'start' : 'end';
		const endpoint = value.start ?? value.end!;
		return timeRangeEndpointAvailable(endpoint, part, value, constraints)
			? Object.freeze({ valid: true })
			: Object.freeze({ reason: `${part}-unavailable`, valid: false });
	}
	if (constraints.rangeMode === 'ordered' && value.start.compare(value.end) > 0)
		return Object.freeze({ reason: 'order', valid: false });
	if (!timeRangeEndpointAvailable(value.start, 'start', value, constraints))
		return Object.freeze({ reason: 'start-unavailable', valid: false });
	if (!timeRangeEndpointAvailable(value.end, 'end', value, constraints))
		return Object.freeze({ reason: 'end-unavailable', valid: false });
	return Object.freeze({ valid: true });
}

export function resolveTimeRangePreset(
	preset: TimeRangePickerPreset,
	constraints: TimeRangeConstraints
): TimeRangeValue | null | undefined {
	const candidate = normalizeTimeRangeModelValue(
		typeof preset.value === 'function' ? preset.value() : preset.value,
		'ZTimeRangePicker preset'
	);
	return validateTimeRangeValue(candidate, constraints).valid ? candidate : undefined;
}

export function isOvernightTimeRange(
	value: TimeRangeValue | null,
	rangeMode: TimeRangeMode
): boolean {
	return Boolean(
		rangeMode === 'overnight' && value?.start && value.end && value.start.compare(value.end) > 0
	);
}
