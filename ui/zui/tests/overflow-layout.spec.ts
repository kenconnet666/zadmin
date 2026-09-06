import { describe, expect, it } from 'vitest';

import { calculateOverflowLayout } from '../src/runtime/collection/overflow-layout.js';
import type { SelectionKey } from '../src/runtime/collection/selection.js';

describe('OverflowList pure packing contract', () => {
	it('packs logical rows with gaps, preserves typed 1 and string 1 identities, and inserts overflow at the first hidden entry', () => {
		const layout = calculateOverflowLayout<SelectionKey>({
			availableInlineSize: 220,
			collapseFrom: 'end',
			gap: 10,
			items: [
				{ inlineSize: 100, key: 1 },
				{ inlineSize: 100, key: '1' },
				{ inlineSize: 100, key: 'third' }
			],
			maxRows: 1,
			overflowInlineSize: 30
		});
		expect(layout.visibleKeys).toEqual([1]);
		expect(layout.overflowKeys).toEqual(['1', 'third']);
		expect(layout.overflowIndex).toBe(1);
		expect(layout.rows).toBe(1);
		expect(layout.fits).toBe(true);
	});

	it('honors maxVisibleItems=0, pinned keys and reports impossible fixed fits without concealing them', () => {
		const emptyVisible = calculateOverflowLayout({
			availableInlineSize: 100,
			collapseFrom: 'end',
			gap: 8,
			items: [
				{ inlineSize: 40, key: 'one' },
				{ inlineSize: 40, key: 'two' }
			],
			maxRows: 1,
			maxVisibleItems: 0,
			overflowInlineSize: 20
		});
		expect(emptyVisible.visibleKeys).toEqual([]);
		expect(emptyVisible.overflowKeys).toEqual(['one', 'two']);
		expect(emptyVisible.fits).toBe(true);

		const impossible = calculateOverflowLayout({
			availableInlineSize: 80,
			collapseFrom: 'start',
			gap: 8,
			items: [
				{ inlineSize: 70, key: 'pinned-one' },
				{ inlineSize: 70, key: 'pinned-two' },
				{ inlineSize: 30, key: 'candidate' }
			],
			maxRows: 1,
			pinnedKeys: ['pinned-one', 'pinned-two'],
			overflowInlineSize: 20
		});
		expect(impossible.visibleKeys).toEqual(['pinned-one', 'pinned-two']);
		expect(impossible.overflowKeys).toEqual(['candidate']);
		expect(impossible.fits).toBe(false);
	});
});
