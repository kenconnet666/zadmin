import { describe, expect, it } from 'vitest';

import {
	meterState,
	normalizeMeterRange,
	normalizeProgressRange
} from '../src/runtime/progress.js';

describe('progress and meter range normalization', () => {
	it('clamps finite Progress values but rejects invalid ranges', () => {
		expect(normalizeProgressRange({ max: 20, min: 10, value: -5 })).toEqual({
			max: 20,
			min: 10,
			value: 10
		});
		expect(() => normalizeProgressRange({ max: 10, min: 10, value: 10 })).toThrow(/greater/u);
		expect(() => normalizeProgressRange({ max: 20, min: 10, value: Number.NaN })).toThrow(
			/finite/u
		);
	});

	it('strictly rejects Meter values and thresholds outside their native range', () => {
		expect(() => normalizeMeterRange({ max: 100, min: 0, value: 101 })).toThrow(/min <= value/u);
		expect(() => normalizeMeterRange({ high: 20, low: 30, max: 100, min: 0, value: 50 })).toThrow(
			/thresholds/u
		);
		const range = normalizeMeterRange({
			high: 80,
			low: 35,
			max: 100,
			min: 0,
			optimum: 20,
			value: 72
		});
		expect(meterState(range)).toBe('suboptimal');
	});
});
