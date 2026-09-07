import type { CalendarDateTime, ZonedDateTime } from '@internationalized/date';
import {
	compareDateTime,
	isDateTimeUnavailable,
	normalizeDateTimeModelValue,
	type DateTimeMode,
	type DateTimeValue
} from './date-time.js';

export type DateTimeRangePart = 'start' | 'end';
export type DateTimeRangeOrder = 'strict' | 'swap';

export interface DateTimeRangeValue<TMode extends DateTimeMode> {
	readonly end: DateTimeValue<TMode> | null;
	readonly start: DateTimeValue<TMode> | null;
}

export type LocalDateTimeRangeValue = DateTimeRangeValue<'local'>;
export type ZonedDateTimeRangeValue = DateTimeRangeValue<'zoned'>;
export type AnyDateTimeRangeValue = LocalDateTimeRangeValue | ZonedDateTimeRangeValue;

export interface DateTimeRangePreset<TMode extends DateTimeMode> {
	readonly label: string;
	readonly value: DateTimeRangeValue<TMode> | (() => DateTimeRangeValue<TMode>);
}

export interface DateTimeRangeConstraints<TMode extends DateTimeMode> {
	readonly allowEmpty: boolean;
	readonly isDateTimeUnavailable?: (
		value: DateTimeValue<TMode>,
		part: DateTimeRangePart,
		range: DateTimeRangeValue<TMode>
	) => boolean;
	readonly maxValue?: DateTimeValue<TMode>;
	readonly minValue?: DateTimeValue<TMode>;
	readonly mode: TMode;
	readonly order: DateTimeRangeOrder;
}

export type DateTimeRangeInvalidReason =
	'end-unavailable' | 'order' | 'partial' | 'start-unavailable';

export interface DateTimeRangeValidation {
	readonly reason?: DateTimeRangeInvalidReason;
	readonly valid: boolean;
}

export interface ResolvedDateTimeRangeCandidate<TMode extends DateTimeMode> {
	readonly part: DateTimeRangePart;
	readonly range: DateTimeRangeValue<TMode> | null;
}

/** Stages a typed user candidate without applying availability or strict-order validation. */
export function stageDateTimeRangeCandidate<TMode extends DateTimeMode>(
	range: DateTimeRangeValue<TMode> | null,
	part: DateTimeRangePart,
	value: DateTimeValue<TMode> | null,
	order: DateTimeRangeOrder
): ResolvedDateTimeRangeCandidate<TMode> {
	let candidate = replaceDateTimeRangePart(range, part, value);
	let resolvedPart = part;
	if (
		order === 'swap' &&
		candidate?.start &&
		candidate.end &&
		compareDateTime(candidate.start, candidate.end) > 0
	) {
		candidate = Object.freeze({ end: candidate.start, start: candidate.end });
		resolvedPart = part === 'start' ? 'end' : 'start';
	}
	return Object.freeze({ part: resolvedPart, range: candidate });
}

export function normalizeDateTimeRangeModelValue<TMode extends DateTimeMode>(
	value: unknown,
	mode: TMode,
	owner = 'ZDateTimeRangePicker'
): DateTimeRangeValue<TMode> | null {
	if (value === null || value === undefined) return null;
	if (
		typeof value !== 'object' ||
		Object.getPrototypeOf(value) !== Object.prototype ||
		!Object.hasOwn(value, 'start') ||
		!Object.hasOwn(value, 'end')
	)
		throw new TypeError(
			`${owner} model value must be a date-time range with nullable start and end, null or undefined.`
		);
	const range = value as { readonly end: unknown; readonly start: unknown };
	const start = normalizeDateTimeModelValue(range.start, mode, `${owner} start`);
	const end = normalizeDateTimeModelValue(range.end, mode, `${owner} end`);
	return start === null && end === null ? null : Object.freeze({ end, start });
}

export function dateTimeRangeValue<TMode extends DateTimeMode>(
	start: DateTimeValue<TMode> | null | undefined,
	end: DateTimeValue<TMode> | null | undefined
): DateTimeRangeValue<TMode> | null {
	if (!start && !end) return null;
	return Object.freeze({ end: end ?? null, start: start ?? null });
}

export function sameDateTimeRangeValue<TMode extends DateTimeMode>(
	left: DateTimeRangeValue<TMode> | null,
	right: DateTimeRangeValue<TMode> | null
): boolean {
	return (
		left === right ||
		(left !== null &&
			right !== null &&
			(left.start === right.start ||
				(left.start !== null &&
					right.start !== null &&
					compareDateTime(left.start, right.start) === 0)) &&
			(left.end === right.end ||
				(left.end !== null && right.end !== null && compareDateTime(left.end, right.end) === 0)))
	);
}

export function replaceDateTimeRangePart<TMode extends DateTimeMode>(
	range: DateTimeRangeValue<TMode> | null,
	part: DateTimeRangePart,
	value: DateTimeValue<TMode> | null
): DateTimeRangeValue<TMode> | null {
	return part === 'start'
		? dateTimeRangeValue(value, range?.end)
		: dateTimeRangeValue(range?.start, value);
}

export function validateDateTimeRangeConstraints<TMode extends DateTimeMode>(
	constraints: DateTimeRangeConstraints<TMode>
): void {
	if (constraints.order !== 'strict' && constraints.order !== 'swap')
		throw new TypeError("ZDateTimeRangePicker order must be 'strict' or 'swap'.");
	if (constraints.minValue !== undefined)
		normalizeDateTimeModelValue(
			constraints.minValue,
			constraints.mode,
			'ZDateTimeRangePicker minValue'
		);
	if (constraints.maxValue !== undefined)
		normalizeDateTimeModelValue(
			constraints.maxValue,
			constraints.mode,
			'ZDateTimeRangePicker maxValue'
		);
	if (
		constraints.minValue &&
		constraints.maxValue &&
		compareDateTime(constraints.minValue, constraints.maxValue) > 0
	)
		throw new RangeError('ZDateTimeRangePicker minValue cannot exceed maxValue.');
}

function endpointUnavailable<TMode extends DateTimeMode>(
	value: DateTimeValue<TMode>,
	part: DateTimeRangePart,
	range: DateTimeRangeValue<TMode>,
	constraints: DateTimeRangeConstraints<TMode>
): boolean {
	return isDateTimeUnavailable(
		value,
		constraints.minValue,
		constraints.maxValue,
		(candidate) => constraints.isDateTimeUnavailable?.(candidate, part, range) ?? false
	);
}

/** Validates an already-owned range. External model values are never reordered. */
export function validateDateTimeRangeValue<TMode extends DateTimeMode>(
	value: DateTimeRangeValue<TMode> | null,
	constraints: DateTimeRangeConstraints<TMode>
): DateTimeRangeValidation {
	validateDateTimeRangeConstraints(constraints);
	if (!value) return Object.freeze({ valid: true });
	if (!value.start || !value.end) {
		if (!constraints.allowEmpty) return Object.freeze({ reason: 'partial', valid: false });
		const part: DateTimeRangePart = value.start ? 'start' : 'end';
		const endpoint = value.start ?? value.end!;
		return endpointUnavailable(endpoint, part, value, constraints)
			? Object.freeze({ reason: `${part}-unavailable`, valid: false })
			: Object.freeze({ valid: true });
	}
	if (compareDateTime(value.start, value.end) > 0)
		return Object.freeze({ reason: 'order', valid: false });
	if (endpointUnavailable(value.start, 'start', value, constraints))
		return Object.freeze({ reason: 'start-unavailable', valid: false });
	if (endpointUnavailable(value.end, 'end', value, constraints))
		return Object.freeze({ reason: 'end-unavailable', valid: false });
	return Object.freeze({ valid: true });
}

/**
 * Resolves a user candidate immediately before it enters the owner. `swap` applies only to a
 * complete reversed candidate and remaps the edited part before validating both endpoints.
 */
export function resolveDateTimeRangeCandidate<TMode extends DateTimeMode>(
	range: DateTimeRangeValue<TMode> | null,
	part: DateTimeRangePart,
	value: DateTimeValue<TMode> | null,
	constraints: DateTimeRangeConstraints<TMode>,
	allowPartial = true
): ResolvedDateTimeRangeCandidate<TMode> | undefined {
	validateDateTimeRangeConstraints(constraints);
	const staged = stageDateTimeRangeCandidate(range, part, value, constraints.order);
	const candidate = staged.range;
	if (
		constraints.order === 'strict' &&
		candidate?.start &&
		candidate.end &&
		compareDateTime(candidate.start, candidate.end) > 0
	)
		return undefined;
	const validation = validateDateTimeRangeValue(candidate, {
		...constraints,
		allowEmpty: allowPartial || constraints.allowEmpty
	});
	return validation.valid ? staged : undefined;
}

export function resolveDateTimeRangePreset<TMode extends DateTimeMode>(
	preset: DateTimeRangePreset<TMode>,
	constraints: DateTimeRangeConstraints<TMode>
): DateTimeRangeValue<TMode> | null | undefined {
	let candidate = normalizeDateTimeRangeModelValue(
		typeof preset.value === 'function' ? preset.value() : preset.value,
		constraints.mode,
		'ZDateTimeRangePicker preset'
	);
	if (candidate?.start && candidate.end && compareDateTime(candidate.start, candidate.end) > 0) {
		if (constraints.order === 'strict') return undefined;
		candidate = Object.freeze({ end: candidate.start, start: candidate.end });
	}
	return validateDateTimeRangeValue(candidate, constraints).valid ? candidate : undefined;
}

export type LocalDateTimeRangePreset = DateTimeRangePreset<'local'>;
export type ZonedDateTimeRangePreset = DateTimeRangePreset<'zoned'>;
export type LocalDateTimeRange = {
	readonly start: CalendarDateTime;
	readonly end: CalendarDateTime;
};
export type ZonedDateTimeRange = {
	readonly start: ZonedDateTime;
	readonly end: ZonedDateTime;
};
