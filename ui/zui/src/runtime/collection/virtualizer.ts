export interface VirtualItem {
	readonly end: number;
	readonly index: number;
	readonly size: number;
	readonly start: number;
}

export interface VirtualRange {
	readonly endIndex: number;
	readonly items: readonly VirtualItem[];
	readonly startIndex: number;
	readonly totalSize: number;
}

export interface VirtualRangeOptions {
	readonly count: number;
	readonly itemSize: number;
	readonly overscan?: number;
	readonly scrollOffset: number;
	readonly viewportSize: number;
}

export type VirtualAlign = 'center' | 'end' | 'nearest' | 'start';

function positiveInteger(value: number, name: string, allowZero = false): number {
	if (!Number.isInteger(value) || value < (allowZero ? 0 : 1)) {
		throw new TypeError(`${name} must be ${allowZero ? 'a non-negative' : 'a positive'} integer.`);
	}
	return value;
}

export function calculateVirtualRange(options: VirtualRangeOptions): VirtualRange {
	const count = positiveInteger(options.count, 'Virtualizer count', true);
	if (!Number.isFinite(options.itemSize) || options.itemSize <= 0) {
		throw new TypeError('Virtualizer itemSize must be positive and finite.');
	}
	if (!Number.isFinite(options.viewportSize) || options.viewportSize < 0) {
		throw new TypeError('Virtualizer viewportSize must be non-negative and finite.');
	}
	if (!Number.isFinite(options.scrollOffset)) {
		throw new TypeError('Virtualizer scrollOffset must be finite.');
	}
	const overscan = positiveInteger(options.overscan ?? 4, 'Virtualizer overscan', true);
	const totalSize = count * options.itemSize;
	if (count === 0) {
		return Object.freeze({ endIndex: 0, items: Object.freeze([]), startIndex: 0, totalSize: 0 });
	}
	const offset = Math.min(
		Math.max(0, options.scrollOffset),
		Math.max(0, totalSize - options.viewportSize)
	);
	const visibleStart = Math.floor(offset / options.itemSize);
	const visibleEnd = Math.min(count, Math.ceil((offset + options.viewportSize) / options.itemSize));
	const startIndex = Math.max(0, visibleStart - overscan);
	const endIndex = Math.min(count, visibleEnd + overscan);
	const items = Object.freeze(
		Array.from({ length: endIndex - startIndex }, (_, itemOffset) => {
			const index = startIndex + itemOffset;
			const start = index * options.itemSize;
			return Object.freeze({ end: start + options.itemSize, index, size: options.itemSize, start });
		})
	);
	return Object.freeze({ endIndex, items, startIndex, totalSize });
}

export function virtualScrollOffset(
	index: number,
	options: Omit<VirtualRangeOptions, 'overscan' | 'scrollOffset'> & {
		readonly align?: VirtualAlign;
		readonly currentOffset?: number;
	}
): number {
	const count = positiveInteger(options.count, 'Virtualizer count', true);
	if (count === 0) return 0;
	if (!Number.isInteger(index)) throw new TypeError('Virtualizer index must be an integer.');
	if (!Number.isFinite(options.itemSize) || options.itemSize <= 0) {
		throw new TypeError('Virtualizer itemSize must be positive and finite.');
	}
	if (!Number.isFinite(options.viewportSize) || options.viewportSize < 0) {
		throw new TypeError('Virtualizer viewportSize must be non-negative and finite.');
	}
	const resolvedIndex = Math.min(count - 1, Math.max(0, index));
	const start = resolvedIndex * options.itemSize;
	const end = start + options.itemSize;
	const maxOffset = Math.max(0, count * options.itemSize - options.viewportSize);
	const current = Math.min(maxOffset, Math.max(0, options.currentOffset ?? 0));
	const align = options.align ?? 'nearest';
	const target =
		align === 'start'
			? start
			: align === 'end'
				? end - options.viewportSize
				: align === 'center'
					? start - (options.viewportSize - options.itemSize) / 2
					: start < current
						? start
						: end > current + options.viewportSize
							? end - options.viewportSize
							: current;
	return Math.min(maxOffset, Math.max(0, target));
}
