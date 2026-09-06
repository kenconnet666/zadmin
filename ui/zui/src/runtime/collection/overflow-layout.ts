import { assertSelectionKey, type SelectionKey } from './selection.js';

export type OverflowCollapseFrom = 'start' | 'end';
export interface OverflowLayoutItem<TKey extends SelectionKey = SelectionKey> {
	readonly key: TKey;
	readonly inlineSize: number;
}
export interface OverflowLayoutOptions<TKey extends SelectionKey = SelectionKey> {
	readonly items: readonly OverflowLayoutItem<TKey>[];
	readonly availableInlineSize: number;
	readonly overflowInlineSize: number;
	readonly gap: number;
	readonly maxRows: number;
	readonly maxVisibleItems?: number;
	readonly collapseFrom: OverflowCollapseFrom;
	readonly pinnedKeys?: readonly TKey[];
}
export interface OverflowLayout<TKey extends SelectionKey = SelectionKey> {
	readonly visibleKeys: readonly TKey[];
	readonly overflowKeys: readonly TKey[];
	readonly overflowIndex: number;
	readonly rows: number;
	readonly fits: boolean;
}

export function sameOverflowLayout<TKey extends SelectionKey>(
	a: OverflowLayout<TKey> | null,
	b: OverflowLayout<TKey>
): boolean {
	return (
		a !== null &&
		a.fits === b.fits &&
		a.rows === b.rows &&
		a.overflowIndex === b.overflowIndex &&
		a.visibleKeys.length === b.visibleKeys.length &&
		a.visibleKeys.every((key, index) => key === b.visibleKeys[index]) &&
		a.overflowKeys.length === b.overflowKeys.length &&
		a.overflowKeys.every((key, index) => key === b.overflowKeys[index])
	);
}

const PIXEL_TOLERANCE = 0.5;

export function assertOverflowCount(value: number, name: string, minimum: number): void {
	if (!Number.isSafeInteger(value) || value < minimum)
		throw new TypeError(`${name} must be a safe integer of at least ${minimum}.`);
}

/** Logical source order drives packing. Widths are actual, untransformed CSS layout sizes. */
export function calculateOverflowLayout<TKey extends SelectionKey>(
	options: OverflowLayoutOptions<TKey>
): OverflowLayout<TKey> {
	const {
		items,
		availableInlineSize: available,
		overflowInlineSize,
		gap,
		maxRows,
		maxVisibleItems,
		collapseFrom
	} = options;
	assertOverflowCount(maxRows, 'maxRows', 1);
	if (maxVisibleItems !== undefined) assertOverflowCount(maxVisibleItems, 'maxVisibleItems', 0);
	if (collapseFrom !== 'start' && collapseFrom !== 'end')
		throw new TypeError('Invalid collapseFrom.');
	for (const value of [
		available,
		overflowInlineSize,
		gap,
		...items.map((item) => item.inlineSize)
	]) {
		if (!Number.isFinite(value) || value < 0)
			throw new TypeError('Overflow layout sizes must be finite and non-negative.');
	}
	const keys = new Set<TKey>();
	for (const item of items) {
		assertSelectionKey(item.key, 'OverflowList');
		if (keys.has(item.key)) throw new TypeError('OverflowList items require unique keys.');
		keys.add(item.key);
	}
	for (const key of options.pinnedKeys ?? []) assertSelectionKey(key, 'OverflowList pinned');
	const pinned = new Set(options.pinnedKeys);
	const hidden = new Set<TKey>();
	const candidates = items.filter((item) => !pinned.has(item.key));
	if (collapseFrom === 'end') candidates.reverse();
	let candidateIndex = 0;
	const limit = maxVisibleItems ?? items.length;
	while (items.length - hidden.size > limit && candidateIndex < candidates.length) {
		hidden.add(candidates[candidateIndex++]!.key);
	}

	function snapshot(): OverflowLayout<TKey> {
		const overflowIndex = items.findIndex((item) => hidden.has(item.key));
		const sequence: number[] = [];
		const visibleKeys: TKey[] = [];
		const overflowKeys: TKey[] = [];
		items.forEach((item, index) => {
			if (index === overflowIndex) sequence.push(overflowInlineSize);
			if (hidden.has(item.key)) overflowKeys.push(item.key);
			else {
				visibleKeys.push(item.key);
				sequence.push(item.inlineSize);
			}
		});
		let rows = 0;
		let used = 0;
		let rowItems = 0;
		let fitsWidth = true;
		for (const width of sequence) {
			if (width > available + PIXEL_TOLERANCE) fitsWidth = false;
			if (rowItems === 0 || used + gap + width > available + PIXEL_TOLERANCE) {
				rows += 1;
				used = width;
				rowItems = 1;
			} else {
				used += gap + width;
				rowItems += 1;
			}
		}
		return {
			visibleKeys,
			overflowKeys,
			overflowIndex: overflowIndex < 0 ? items.length : overflowIndex,
			rows,
			fits: fitsWidth && rows <= maxRows && visibleKeys.length <= limit
		};
	}
	let result = snapshot();
	while (!result.fits && candidateIndex < candidates.length) {
		hidden.add(candidates[candidateIndex++]!.key);
		result = snapshot();
	}
	return result;
}
