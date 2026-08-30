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
	});
});
