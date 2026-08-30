import { describe, expect, it } from 'vitest';

import {
	meterState,
	normalizeMeterRange,
	normalizeProgressRange
} from '../src/runtime/progress.js';

describe('progress ranges', () => {
	it('clamps finite progress values and preserves indeterminate state', () => {
		expect(normalizeProgressRange({ max: 10, min: 2, value: 20 })).toEqual({
			max: 10,
			min: 2,
			value: 10
		});
		expect(normalizeProgressRange({ max: 10, min: 2 })).toEqual({
			max: 10,
			min: 2,
			value: undefined
		});
		expect(() => normalizeProgressRange({ max: 0, min: 0 })).toThrow(/greater than min/u);
		expect(() => normalizeProgressRange({ max: 10, min: 0, value: Number.NaN })).toThrow(
			/value must be finite/u
		);
	});

	it('validates native meter thresholds and identifies regions around optimum', () => {
		const range = normalizeMeterRange({
			high: 80,
			low: 35,
			max: 100,
			min: 0,
			optimum: 20,
			value: 72
		});
		expect(meterState(range)).toBe('suboptimal');
		expect(meterState({ ...range, value: 20 })).toBe('optimal');
		expect(meterState({ ...range, value: 95 })).toBe('critical');
		expect(() => normalizeMeterRange({ high: 30, low: 40, max: 100, min: 0, value: 20 })).toThrow(
			/thresholds/u
		);
		const highOptimum = normalizeMeterRange({
			high: 80,
			low: 35,
			max: 100,
			min: 0,
			optimum: 90,
			value: 90
		});
		expect(meterState(highOptimum)).toBe('optimal');
		expect(meterState({ ...highOptimum, value: 50 })).toBe('suboptimal');
		expect(meterState({ ...highOptimum, value: 10 })).toBe('critical');
		const middleOptimum = normalizeMeterRange({ high: 80, low: 20, max: 100, min: 0, value: 50 });
		expect(meterState(middleOptimum)).toBe('optimal');
		expect(meterState({ ...middleOptimum, value: 90 })).toBe('suboptimal');
		expect(() => normalizeMeterRange({ max: 100, min: 0 })).toThrow(/value is required/u);
	});
});
