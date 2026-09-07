import type { Time } from '@internationalized/date';

import { normalizeTimeModelValue } from './date.js';
import { normalizeTimeValue, serializeTimeValue, type TimeValueGranularity } from './time-value.js';

export type TimeGridGranularity = TimeValueGranularity;

export interface TimeGridSlot {
	readonly disabled?: boolean;
	readonly label?: string;
	readonly value: Time;
}

export interface TimeGridConstraints {
	readonly isTimeUnavailable?: (value: Time) => boolean;
	readonly maxValue?: Time;
	readonly minValue?: Time;
}

export interface NormalizedTimeGridSlot {
	readonly disabled: boolean;
	readonly key: string;
	readonly label?: string;
	readonly value: Time;
}

export function sameTimeGridValue(left: Time | null, right: Time | null): boolean {
	return left === right || (left !== null && right !== null && left.compare(right) === 0);
}

export function normalizeTimeGridValue(value: unknown, owner = 'ZTimeGrid'): Time | null {
	return normalizeTimeModelValue(value, owner);
}

export function validateTimeGridConstraints(constraints: TimeGridConstraints): void {
	const min =
		constraints.minValue !== undefined
			? normalizeTimeValue(constraints.minValue, 'ZTimeGrid minValue')
			: undefined;
	const max =
		constraints.maxValue !== undefined
			? normalizeTimeValue(constraints.maxValue, 'ZTimeGrid maxValue')
			: undefined;
	if (min && max && min.compare(max) > 0)
		throw new RangeError('ZTimeGrid minValue cannot exceed maxValue.');
	if (
		constraints.isTimeUnavailable !== undefined &&
		typeof constraints.isTimeUnavailable !== 'function'
	)
		throw new TypeError('ZTimeGrid isTimeUnavailable must be a function.');
}

export function timeGridValueAvailable(value: Time, constraints: TimeGridConstraints): boolean {
	const candidate = normalizeTimeValue(value, 'ZTimeGrid candidate');
	validateTimeGridConstraints(constraints);
	return !(
		(constraints.minValue && candidate.compare(constraints.minValue) < 0) ||
		(constraints.maxValue && candidate.compare(constraints.maxValue) > 0) ||
		constraints.isTimeUnavailable?.(candidate)
	);
}

export function normalizeTimeGridSlots(
	slots: readonly TimeGridSlot[]
): readonly NormalizedTimeGridSlot[] {
	if (!Array.isArray(slots)) throw new TypeError('ZTimeGrid slots must be an array.');
	const keys = new Set<string>();
	return Object.freeze(
		slots.map((slot, index) => {
			if (
				!slot ||
				typeof slot !== 'object' ||
				Array.isArray(slot) ||
				Object.getPrototypeOf(slot) !== Object.prototype
			)
				throw new TypeError(`ZTimeGrid slots[${index}] must be an object.`);
			const value = normalizeTimeValue(slot.value, `ZTimeGrid slots[${index}].value`);
			const key = serializeTimeValue(value);
			if (keys.has(key))
				throw new TypeError(`ZTimeGrid slots must contain unique Time values (${key}).`);
			keys.add(key);
			if (slot.label !== undefined && (typeof slot.label !== 'string' || !slot.label.trim()))
				throw new TypeError(`ZTimeGrid slots[${index}].label must be a non-empty string.`);
			if (slot.disabled !== undefined && typeof slot.disabled !== 'boolean')
				throw new TypeError(`ZTimeGrid slots[${index}].disabled must be a boolean.`);
			return Object.freeze({
				disabled: slot.disabled ?? false,
				key,
				label: slot.label,
				value
			});
		})
	);
}

export function timeGridContainsValue(
	slots: readonly Pick<NormalizedTimeGridSlot, 'value'>[],
	value: Time
): boolean {
	const candidate = normalizeTimeValue(value, 'ZTimeGrid value');
	return slots.some((slot) => slot.value.compare(candidate) === 0);
}

export function timeGridValueSelectable(
	slots: readonly Pick<NormalizedTimeGridSlot, 'disabled' | 'value'>[],
	value: Time,
	constraints: TimeGridConstraints
): boolean {
	const candidate = normalizeTimeValue(value, 'ZTimeGrid value');
	const slot = slots.find((item) => item.value.compare(candidate) === 0);
	return Boolean(slot && !slot.disabled && timeGridValueAvailable(candidate, constraints));
}
