import { describe, expect, it } from 'vitest';

import {
	calculateVirtualRange,
	KeyedVirtualizer,
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

describe('keyed virtualizer', () => {
	it('keeps number and string keys distinct while exposing visible and overscan windows', () => {
		const virtualizer = new KeyedVirtualizer({
			estimateSize: 40,
			keys: [1, '1', 'tail'],
			overscan: 1,
			scrollOffset: 40,
			viewportSize: 40
		});

		expect(virtualizer.range).toMatchObject({
			endIndex: 3,
			startIndex: 0,
			totalSize: 120,
			visibleEndIndex: 2,
			visibleStartIndex: 1
		});
		expect(virtualizer.range.items.map(({ key }) => key)).toEqual([1, '1', 'tail']);
		expect(virtualizer.indexOf(1)).toBe(0);
		expect(virtualizer.indexOf('1')).toBe(1);
	});

	it('stores dynamic measurements by key and preserves the first visible anchor', () => {
		const virtualizer = new KeyedVirtualizer({
			estimateSize: 40,
			keys: ['a', 'b', 'c', 'd'],
			overscan: 0,
			scrollOffset: 45,
			viewportSize: 60
		});

		expect(virtualizer.measure([{ key: 'a', size: 80 }])).toBe(true);
		expect(virtualizer.scrollOffset).toBe(85);
		expect(virtualizer.range.items[0]?.key).toBe('b');
		expect(virtualizer.range.items[0]?.measured).toBe(false);

		virtualizer.update({ estimateSize: 40, keys: ['prepended', 'a', 'b', 'c', 'd'], overscan: 0 });
		expect(virtualizer.scrollOffset).toBe(125);
		expect(virtualizer.range.items[0]?.key).toBe('b');
		expect(virtualizer.totalSize).toBe(240);

		expect(virtualizer.measure([{ key: 'removed', size: 99 }])).toBe(false);
		expect(virtualizer.clearMeasurements(['a'])).toBe(true);
		expect(virtualizer.scrollOffset).toBe(85);
		expect(virtualizer.clearMeasurements()).toBe(false);
	});

	it('restores the nearest retained anchor when the visible key is removed', () => {
		const virtualizer = new KeyedVirtualizer({
			estimateSize: 30,
			keys: ['a', 'b', 'c', 'd'],
			scrollOffset: 35,
			viewportSize: 30
		});

		virtualizer.update({ estimateSize: 30, keys: ['a', 'c', 'd'] });
		expect(virtualizer.scrollOffset).toBe(35);
		expect(virtualizer.range.items.some(({ key }) => key === 'c')).toBe(true);

		virtualizer.update({ estimateSize: 30, keys: ['a'] });
		expect(virtualizer.scrollOffset).toBe(0);
		expect(virtualizer.range.items[0]?.key).toBe('a');

		virtualizer.update({ estimateSize: 30, keys: ['a', 'tail'] });
		virtualizer.setScrollOffset(15);
		virtualizer.update({ estimateSize: 30, keys: ['replacement', 'other'] });
		expect(virtualizer.scrollOffset).toBe(0);
	});

	it('scrolls by key or clamped index with all alignments', () => {
		const virtualizer = new KeyedVirtualizer({
			estimateSize: (key) => (key === 'large' ? 80 : 20),
			keys: ['first', 'large', 'last'],
			viewportSize: 60
		});

		expect(virtualizer.scrollToKey('large', 'end')).toBe(true);
		expect(virtualizer.scrollOffset).toBe(40);
		expect(virtualizer.ensureKey('large')).toBe(true);
		expect(virtualizer.scrollOffset).toBe(40);
		expect(virtualizer.scrollToKey('unknown', 'start')).toBe(false);
		expect(virtualizer.scrollToIndex(2, 'center')).toBe(60);
		expect(virtualizer.scrollToIndex(99, 'end')).toBe(60);
		virtualizer.setViewportSize(140);
		expect(virtualizer.scrollOffset).toBe(0);
	});

	it('produces an explicit SSR range and rejects invalid contracts', () => {
		const virtualizer = new KeyedVirtualizer({
			estimateSize: 25,
			keys: Array.from({ length: 100 }, (_, index) => `row-${index}`),
			overscan: 2,
			viewportSize: 100
		});
		expect(virtualizer.range).toMatchObject({
			endIndex: 6,
			startIndex: 0,
			visibleEndIndex: 4,
			visibleStartIndex: 0
		});

		expect(new KeyedVirtualizer({ estimateSize: 20, keys: [], viewportSize: 100 }).range).toEqual({
			endIndex: 0,
			items: [],
			startIndex: 0,
			totalSize: 0,
			visibleEndIndex: 0,
			visibleStartIndex: 0
		});
		expect(
			() => new KeyedVirtualizer({ estimateSize: 20, keys: ['same', 'same'], viewportSize: 100 })
		).toThrow(/Duplicate keyed virtualizer key string:"same"/u);
		expect(
			() => new KeyedVirtualizer({ estimateSize: 20, keys: [Number.NaN], viewportSize: 100 })
		).toThrow(/finite numbers/u);
		expect(
			() => new KeyedVirtualizer({ estimateSize: 0, keys: ['row'], viewportSize: 100 }).range
		).toThrow(/estimate/u);
		expect(() => virtualizer.measure([{ key: 'row-0', size: -1 }])).toThrow(/measurement/u);
		expect(() => virtualizer.setScrollOffset(Number.NaN)).toThrow(/scrollOffset/u);
		virtualizer.setScrollOffset(-40);
		expect(virtualizer.scrollOffset).toBe(0);
		expect(() => virtualizer.setViewportSize(-1)).toThrow(/viewportSize/u);
		expect(() => virtualizer.scrollToIndex(0.5)).toThrow(/integer/u);
	});
});
