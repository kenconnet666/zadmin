import { Time } from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
	normalizeTimeGridSlots,
	normalizeTimeGridValue,
	timeGridContainsValue,
	timeGridValueSelectable
} from '../src/runtime/time-grid.js';
import { formatTimeValue, serializeTimeValue } from '../src/runtime/time-value.js';

describe('time grid typed slots', () => {
	it('normalizes explicit Time slots without parsing strings and preserves order', () => {
		const opening = new Time(8, 30);
		const closing = new Time(17, 45, 30, 125);
		const slots = normalizeTimeGridSlots([
			{ label: 'Opening', value: opening },
			{ disabled: true, value: closing }
		]);
		expect(slots.map((slot) => slot.key)).toEqual(['08:30:00', '17:45:30.125']);
		expect(slots[0]?.value).toBe(opening);
		expect(slots[1]?.disabled).toBe(true);
		expect(Object.isFrozen(slots)).toBe(true);
		expect(Object.isFrozen(slots[0])).toBe(true);
		expect(() => normalizeTimeGridValue('08:30', 'ZTimeGrid')).toThrow(/must be a Time/u);
	});

	it('rejects duplicate values even when labels differ', () => {
		expect(() =>
			normalizeTimeGridSlots([
				{ label: 'Morning', value: new Time(9) },
				{ label: 'Standup', value: new Time(9) }
			])
		).toThrow(/unique Time values/u);
	});

	it('combines explicit membership, slot state, min/max and the unavailable predicate', () => {
		const slots = normalizeTimeGridSlots([
			{ value: new Time(8) },
			{ value: new Time(9) },
			{ disabled: true, value: new Time(10) },
			{ value: new Time(11) }
		]);
		const constraints = {
			isTimeUnavailable: (value: Time) => value.hour === 11,
			maxValue: new Time(11),
			minValue: new Time(9)
		};
		expect(timeGridContainsValue(slots, new Time(9))).toBe(true);
		expect(timeGridContainsValue(slots, new Time(9, 30))).toBe(false);
		expect(timeGridValueSelectable(slots, new Time(8), constraints)).toBe(false);
		expect(timeGridValueSelectable(slots, new Time(9), constraints)).toBe(true);
		expect(timeGridValueSelectable(slots, new Time(10), constraints)).toBe(false);
		expect(timeGridValueSelectable(slots, new Time(11), constraints)).toBe(false);
		expect(timeGridValueSelectable(slots, new Time(12), constraints)).toBe(false);
	});

	it('formats by locale/hour cycle/granularity while serialization preserves full precision', () => {
		const value = new Time(13, 5, 9, 125);
		expect(formatTimeValue(value, 'en-US', { granularity: 'minute', hourCycle: 12 })).toMatch(
			/^1:05\sPM$/u
		);
		expect(formatTimeValue(value, 'en-US', { granularity: 'second', hourCycle: 24 })).toBe(
			'13:05:09'
		);
		expect(serializeTimeValue(value)).toBe('13:05:09.125');
	});
});
