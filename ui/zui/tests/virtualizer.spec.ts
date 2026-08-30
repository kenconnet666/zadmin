import { describe, expect, it } from 'vitest';

import {
	calculateVirtualRange,
	virtualScrollOffset
} from '../src/runtime/collection/virtualizer.js';

describe('fixed-size virtualizer', () => {
	it('calculates clamped visible ranges with overscan', () => {
		const range = calculateVirtualRange({
			count: 1000,
			itemSize: 40,
			overscan: 2,
			scrollOffset: 400,
			viewportSize: 120
		});
		expect(range).toMatchObject({ endIndex: 15, startIndex: 8, totalSize: 40000 });
		expect(range.items).toHaveLength(7);
		expect(range.items[0]).toEqual({ end: 360, index: 8, size: 40, start: 320 });
	});

	it('computes nearest and centered scroll offsets', () => {
		expect(
			virtualScrollOffset(12, { count: 100, currentOffset: 0, itemSize: 40, viewportSize: 120 })
		).toBe(400);
		expect(
			virtualScrollOffset(12, { align: 'center', count: 100, itemSize: 40, viewportSize: 120 })
		).toBe(440);
		expect(
			virtualScrollOffset(99, { align: 'end', count: 100, itemSize: 40, viewportSize: 120 })
		).toBe(3880);
		expect(
			virtualScrollOffset(2, { align: 'start', count: 10, itemSize: 40, viewportSize: 120 })
		).toBe(80);
		expect(
			virtualScrollOffset(2, { count: 10, currentOffset: 40, itemSize: 40, viewportSize: 120 })
		).toBe(40);
		expect(virtualScrollOffset(0, { count: 0, itemSize: 40, viewportSize: 120 })).toBe(0);
	});

	it('rejects invalid range inputs and handles empty collections', () => {
		expect(
			calculateVirtualRange({ count: 0, itemSize: 40, scrollOffset: 0, viewportSize: 120 })
		).toEqual({ endIndex: 0, items: [], startIndex: 0, totalSize: 0 });
		expect(() =>
			calculateVirtualRange({ count: -1, itemSize: 40, scrollOffset: 0, viewportSize: 120 })
		).toThrow(/count/u);
		expect(() =>
			calculateVirtualRange({ count: 1, itemSize: 0, scrollOffset: 0, viewportSize: 120 })
		).toThrow(/itemSize/u);
		expect(() =>
			calculateVirtualRange({ count: 1, itemSize: 40, scrollOffset: 0, viewportSize: -1 })
		).toThrow(/viewportSize/u);
		expect(() =>
			calculateVirtualRange({ count: 1, itemSize: 40, scrollOffset: Number.NaN, viewportSize: 10 })
		).toThrow(/scrollOffset/u);
		expect(() =>
			calculateVirtualRange({
				count: 1,
				itemSize: 40,
				overscan: -1,
				scrollOffset: 0,
				viewportSize: 10
			})
		).toThrow(/overscan/u);
		expect(() => virtualScrollOffset(0.5, { count: 2, itemSize: 40, viewportSize: 80 })).toThrow(
			/index/u
		);
		expect(() => virtualScrollOffset(0, { count: 2, itemSize: 0, viewportSize: 80 })).toThrow(
			/itemSize/u
		);
		expect(() => virtualScrollOffset(0, { count: 2, itemSize: 40, viewportSize: -1 })).toThrow(
			/viewportSize/u
		);
	});
});
