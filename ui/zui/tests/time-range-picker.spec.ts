import { Time } from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
	isOvernightTimeRange,
	normalizeTimeRangeModelValue,
	replaceTimeRangePart,
	resolveTimeRangePreset,
	validateTimeRangeValue,
	type TimeRangeConstraints,
	type TimeRangeValue
} from '../src/runtime/time-range.js';

function constraints(overrides: Partial<TimeRangeConstraints> = {}): TimeRangeConstraints {
	return {
		allowEmpty: false,
		rangeMode: 'ordered',
		...overrides
	};
}

function range(start: number, end: number): TimeRangeValue {
	return { start: new Time(start), end: new Time(end) };
}

describe('time range semantics', () => {
	it('preserves partial endpoints and never swaps a reversed range', () => {
		expect(normalizeTimeRangeModelValue({ start: new Time(9), end: null })?.start?.hour).toBe(9);
		const reversed = normalizeTimeRangeModelValue(range(23, 1));
		expect(reversed?.start?.hour).toBe(23);
		expect(reversed?.end?.hour).toBe(1);
		expect(replaceTimeRangePart(reversed, 'end', null)).toEqual({ start: new Time(23), end: null });
	});

	it('distinguishes ordered rejection from explicit overnight acceptance', () => {
		const reversed = range(23, 1);
		expect(validateTimeRangeValue(reversed, constraints())).toEqual({
			valid: false,
			reason: 'order'
		});
		expect(validateTimeRangeValue(reversed, constraints({ rangeMode: 'overnight' }))).toEqual({
			valid: true
		});
		expect(isOvernightTimeRange(reversed, 'overnight')).toBe(true);
		expect(isOvernightTimeRange(reversed, 'ordered')).toBe(false);
	});

	it('keeps partial values expressible while allowEmpty controls their committed validity', () => {
		const partial = { start: null, end: new Time(17) } satisfies TimeRangeValue;
		expect(validateTimeRangeValue(partial, constraints())).toEqual({
			valid: false,
			reason: 'partial'
		});
		expect(validateTimeRangeValue(partial, constraints({ allowEmpty: true }))).toEqual({
			valid: true
		});
		expect(validateTimeRangeValue(null, constraints())).toEqual({ valid: true });
	});

	it('passes the complete candidate to endpoint availability and rejects presets exactly', () => {
		const rules = constraints({
			isTimeUnavailable: (_value, part, candidate) =>
				part === 'end' && candidate.start?.hour === 9 && candidate.end?.hour === 12
		});
		expect(validateTimeRangeValue(range(9, 12), rules)).toEqual({
			valid: false,
			reason: 'end-unavailable'
		});
		expect(
			resolveTimeRangePreset({ label: 'Rejected', value: () => range(9, 12) }, rules)
		).toBeUndefined();
		expect(resolveTimeRangePreset({ label: 'Accepted', value: range(9, 11) }, rules)).toEqual(
			range(9, 11)
		);
	});

	it('rejects foreign endpoint values and contradictory bounds', () => {
		expect(() => normalizeTimeRangeModelValue({ start: new Date(), end: null })).toThrow(TypeError);
		expect(() =>
			validateTimeRangeValue(
				range(9, 10),
				constraints({ minValue: new Time(11), maxValue: new Time(10) })
			)
		).toThrow(RangeError);
	});
});
