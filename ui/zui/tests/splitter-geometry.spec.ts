import { describe, expect, it } from 'vitest';

import {
	adjacentResizableRange,
	allocateResizableLengths,
	encodeResizableLength,
	parseResizableLength,
	resizeAdjacentPair
} from '../src/runtime/resize.js';

describe('splitter resize geometry', () => {
	it('preserves unit identity while resolving mixed fixed and flexible space', () => {
		const allocation = allocateResizableLengths(
			['240px', 60, '12rem'],
			['120px', 30, '8rem'],
			['50%', undefined, '18rem'],
			868,
			16
		);
		expect(allocation.feasible).toBe(true);
		expect(allocation.pixels.reduce((sum, value) => sum + value, 0)).toBeCloseTo(868, 4);
		expect(encodeResizableLength(allocation.pixels[0], '240px', 868, 16)).toMatch(/px$/u);
		expect(encodeResizableLength(allocation.pixels[1], 60, 868, 16)).toBeTypeOf('number');
		expect(encodeResizableLength(allocation.pixels[2], '12rem', 868, 16)).toMatch(/rem$/u);
	});

	it('bounds an adjacent pair without moving non-adjacent panels', () => {
		const pixels = [200, 400, 200] as const;
		const bounds = [
			{ min: 100, max: 300 },
			{ min: 250, max: 500 },
			{ min: 100, max: 300 }
		] as const;
		expect(adjacentResizableRange(pixels, bounds, 0)).toEqual({ min: 100, max: 300 });
		expect(resizeAdjacentPair(pixels, bounds, 0, 500)).toEqual([300, 300, 200]);
		expect(pixels).toEqual([200, 400, 200]);
	});

	it('degrades impossible dynamic minima proportionally without negative geometry', () => {
		const allocation = allocateResizableLengths(
			[50, 50],
			['300px', '300px'],
			[undefined, undefined],
			400,
			16
		);
		expect(allocation.feasible).toBe(false);
		expect(allocation.pixels).toEqual([200, 200]);
		expect(allocation.pixels.every((value) => value >= 0)).toBe(true);
	});

	it('rejects ambiguous or invalid CSS lengths and inverted constraints', () => {
		expect(() => parseResizableLength('10em' as never)).toThrow(/%, px, or rem/u);
		expect(() => parseResizableLength(-1)).toThrow(/non-negative/u);
		expect(() => allocateResizableLengths([50, 50], [60, 0], [40, 100], 1000, 16)).toThrow(
			/cannot exceed/u
		);
	});
});
