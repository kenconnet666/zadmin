import type { SelectionKey } from './selection.js';

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

export interface KeyedVirtualItem<TKey extends SelectionKey> extends VirtualItem {
	readonly key: TKey;
	readonly measured: boolean;
}

export interface KeyedVirtualRange<TKey extends SelectionKey> {
	/** Inclusive first rendered index, including overscan. */
	readonly startIndex: number;
	/** Exclusive rendered end index, including overscan. */
	readonly endIndex: number;
	readonly items: readonly KeyedVirtualItem<TKey>[];
	readonly totalSize: number;
	/** Inclusive first item intersecting the viewport. */
	readonly visibleStartIndex: number;
	/** Exclusive last item intersecting the viewport. */
	readonly visibleEndIndex: number;
}

export type VirtualSizeEstimate<TKey extends SelectionKey> =
	number | ((key: TKey, index: number) => number);

export interface KeyedVirtualizerOptions<TKey extends SelectionKey> {
	readonly estimateSize: VirtualSizeEstimate<TKey>;
	readonly keys: readonly TKey[];
	readonly overscan?: number;
	readonly scrollOffset?: number;
	readonly viewportSize: number;
}

export interface KeyedVirtualizerUpdate<TKey extends SelectionKey> {
	readonly estimateSize: VirtualSizeEstimate<TKey>;
	readonly keys: readonly TKey[];
	readonly overscan?: number;
}

export interface VirtualMeasurement<TKey extends SelectionKey> {
	readonly key: TKey;
	readonly size: number;
}

interface VirtualLayout<TKey extends SelectionKey> {
	readonly ends: readonly number[];
	readonly items: readonly KeyedVirtualItem<TKey>[];
	readonly starts: readonly number[];
	readonly totalSize: number;
}

interface VirtualAnchor<TKey extends SelectionKey> {
	readonly index: number;
	readonly key: TKey;
	readonly offsetWithin: number;
	readonly order: readonly TKey[];
}

function positiveInteger(value: number, name: string, allowZero = false): number {
	if (!Number.isInteger(value) || value < (allowZero ? 0 : 1)) {
		throw new TypeError(`${name} must be ${allowZero ? 'a non-negative' : 'a positive'} integer.`);
	}
	return value;
}

function finiteSize(value: number, name: string, allowZero = false): number {
	if (!Number.isFinite(value) || value < (allowZero ? 0 : Number.MIN_VALUE)) {
		throw new TypeError(`${name} must be ${allowZero ? 'non-negative' : 'positive'} and finite.`);
	}
	return value;
}

function assertSelectionKey(key: SelectionKey, name: string): void {
	if (typeof key === 'string') return;
	if (!Number.isFinite(key) || Object.is(key, -0)) {
		throw new TypeError(`${name} keys must be strings or finite numbers other than -0.`);
	}
}

function formatSelectionKey(key: SelectionKey): string {
	return typeof key === 'number' ? `number:${key}` : `string:${JSON.stringify(key)}`;
}

function sameKeys<TKey extends SelectionKey>(
	left: readonly TKey[],
	right: readonly TKey[]
): boolean {
	return left.length === right.length && left.every((key, index) => Object.is(key, right[index]));
}

function normalizeKeys<TKey extends SelectionKey>(keys: readonly TKey[]): readonly TKey[] {
	const seen = new Set<TKey>();
	const normalized = keys.map((key) => {
		assertSelectionKey(key, 'Keyed virtualizer');
		if (seen.has(key)) {
			throw new Error(`Duplicate keyed virtualizer key ${formatSelectionKey(key)}.`);
		}
		seen.add(key);
		return key;
	});
	return Object.freeze(normalized);
}

function firstGreater(values: readonly number[], target: number): number {
	let low = 0;
	let high = values.length;
	while (low < high) {
		const middle = low + Math.floor((high - low) / 2);
		if (values[middle]! > target) high = middle;
		else low = middle + 1;
	}
	return low;
}

function firstGreaterOrEqual(values: readonly number[], target: number): number {
	let low = 0;
	let high = values.length;
	while (low < high) {
		const middle = low + Math.floor((high - low) / 2);
		if (values[middle]! >= target) high = middle;
		else low = middle + 1;
	}
	return low;
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

/**
 * Key-owned, DOM-independent vertical virtualizer.
 *
 * Measurements survive sorting and prepends because they are stored by typed
 * business key. The class deliberately owns neither focus nor selection; its
 * `ensureKey`/`isRendered` shape is the bridge consumed by ActiveDescendant.
 */
export class KeyedVirtualizer<TKey extends SelectionKey> {
	#estimateSize: VirtualSizeEstimate<TKey>;
	#indexByKey: ReadonlyMap<TKey, number>;
	#keys: readonly TKey[];
	#layout: VirtualLayout<TKey> | undefined;
	readonly #measurements = new Map<TKey, number>();
	#overscan: number;
	#scrollOffset: number;
	#viewportSize: number;

	constructor(options: KeyedVirtualizerOptions<TKey>) {
		this.#keys = normalizeKeys(options.keys);
		this.#indexByKey = new Map(this.#keys.map((key, index) => [key, index]));
		this.#estimateSize = options.estimateSize;
		this.#overscan = positiveInteger(options.overscan ?? 4, 'Keyed virtualizer overscan', true);
		this.#viewportSize = finiteSize(options.viewportSize, 'Keyed virtualizer viewportSize', true);
		this.#scrollOffset = options.scrollOffset ?? 0;
		if (!Number.isFinite(this.#scrollOffset)) {
			throw new TypeError('Keyed virtualizer scrollOffset must be finite.');
		}
		this.#clampScrollOffset();
	}

	get keys(): readonly TKey[] {
		return this.#keys;
	}

	get range(): KeyedVirtualRange<TKey> {
		const layout = this.#getLayout();
		const count = layout.items.length;
		if (count === 0) {
			return Object.freeze({
				endIndex: 0,
				items: Object.freeze([]),
				startIndex: 0,
				totalSize: 0,
				visibleEndIndex: 0,
				visibleStartIndex: 0
			});
		}
		const visibleStartIndex = Math.min(count - 1, firstGreater(layout.ends, this.#scrollOffset));
		const viewportEnd = this.#scrollOffset + this.#viewportSize;
		const visibleEndIndex = Math.max(
			visibleStartIndex + 1,
			Math.min(count, firstGreaterOrEqual(layout.starts, viewportEnd))
		);
		const startIndex = Math.max(0, visibleStartIndex - this.#overscan);
		const endIndex = Math.min(count, visibleEndIndex + this.#overscan);
		return Object.freeze({
			endIndex,
			items: Object.freeze(layout.items.slice(startIndex, endIndex)),
			startIndex,
			totalSize: layout.totalSize,
			visibleEndIndex,
			visibleStartIndex
		});
	}

	get scrollOffset(): number {
		return this.#scrollOffset;
	}

	get totalSize(): number {
		return this.#getLayout().totalSize;
	}

	get viewportSize(): number {
		return this.#viewportSize;
	}

	indexOf(key: TKey): number {
		return this.#indexByKey.get(key) ?? -1;
	}

	isRendered(key: TKey): boolean {
		return this.range.items.some((item) => Object.is(item.key, key));
	}

	/** Replaces data/estimates while retaining keyed measurements and the visible anchor. */
	update(options: KeyedVirtualizerUpdate<TKey>): void {
		const nextKeys = normalizeKeys(options.keys);
		const nextOverscan = positiveInteger(options.overscan ?? 4, 'Keyed virtualizer overscan', true);
		const anchor = this.#captureAnchor();
		const keysChanged = !sameKeys(this.#keys, nextKeys);
		this.#keys = nextKeys;
		this.#indexByKey = new Map(nextKeys.map((key, index) => [key, index]));
		this.#estimateSize = options.estimateSize;
		this.#overscan = nextOverscan;
		this.#layout = undefined;
		if (keysChanged) {
			const retained = new Set(nextKeys);
			for (const key of this.#measurements.keys()) {
				if (!retained.has(key)) this.#measurements.delete(key);
			}
		}
		this.#restoreAnchor(anchor);
	}

	setViewportSize(viewportSize: number): void {
		this.#viewportSize = finiteSize(viewportSize, 'Keyed virtualizer viewportSize', true);
		this.#clampScrollOffset();
	}

	setScrollOffset(scrollOffset: number): void {
		if (!Number.isFinite(scrollOffset)) {
			throw new TypeError('Keyed virtualizer scrollOffset must be finite.');
		}
		this.#scrollOffset = scrollOffset;
		this.#clampScrollOffset();
	}

	/** Applies one ResizeObserver batch and preserves the first visible key. */
	measure(measurements: readonly VirtualMeasurement<TKey>[]): boolean {
		if (measurements.length === 0) return false;
		const anchor = this.#captureAnchor();
		let changed = false;
		for (const { key, size } of measurements) {
			if (this.indexOf(key) < 0) continue;
			const normalized = finiteSize(size, 'Keyed virtualizer measurement', true);
			if (this.#measurements.get(key) === normalized) continue;
			this.#measurements.set(key, normalized);
			changed = true;
		}
		if (!changed) return false;
		this.#layout = undefined;
		this.#restoreAnchor(anchor);
		return true;
	}

	clearMeasurements(keys?: readonly TKey[]): boolean {
		if (this.#measurements.size === 0) return false;
		const anchor = this.#captureAnchor();
		let changed = false;
		if (keys === undefined) {
			this.#measurements.clear();
			changed = true;
		} else {
			for (const key of keys) changed = this.#measurements.delete(key) || changed;
		}
		if (!changed) return false;
		this.#layout = undefined;
		this.#restoreAnchor(anchor);
		return true;
	}

	ensureKey(key: TKey, align: VirtualAlign = 'nearest'): boolean {
		return this.scrollToKey(key, align);
	}

	scrollToKey(key: TKey, align: VirtualAlign = 'nearest'): boolean {
		const index = this.indexOf(key);
		if (index < 0) return false;
		this.scrollToIndex(index, align);
		return true;
	}

	scrollToIndex(index: number, align: VirtualAlign = 'nearest'): number {
		if (!Number.isInteger(index))
			throw new TypeError('Keyed virtualizer index must be an integer.');
		const count = this.#keys.length;
		if (count === 0) {
			this.#scrollOffset = 0;
			return 0;
		}
		const resolvedIndex = Math.min(count - 1, Math.max(0, index));
		const item = this.#getLayout().items[resolvedIndex]!;
		const maximum = this.#maximumScrollOffset();
		const viewportEnd = this.#scrollOffset + this.#viewportSize;
		const startTarget = item.start;
		const endTarget = item.end - this.#viewportSize;
		const target =
			align === 'start'
				? startTarget
				: align === 'end'
					? endTarget
					: align === 'center'
						? item.start - (this.#viewportSize - item.size) / 2
						: item.start >= this.#scrollOffset && item.end <= viewportEnd
							? this.#scrollOffset
							: Math.abs(startTarget - this.#scrollOffset) <
								  Math.abs(endTarget - this.#scrollOffset)
								? startTarget
								: endTarget;
		this.#scrollOffset = Math.min(maximum, Math.max(0, target));
		return this.#scrollOffset;
	}

	#captureAnchor(): VirtualAnchor<TKey> | undefined {
		const layout = this.#getLayout();
		if (layout.items.length === 0) return undefined;
		const index = Math.min(layout.items.length - 1, firstGreater(layout.ends, this.#scrollOffset));
		const item = layout.items[index]!;
		return {
			index,
			key: item.key,
			offsetWithin: Math.max(0, this.#scrollOffset - item.start),
			order: this.#keys
		};
	}

	#restoreAnchor(anchor: VirtualAnchor<TKey> | undefined): void {
		if (!anchor || this.#keys.length === 0) {
			this.#clampScrollOffset();
			return;
		}
		let key = this.indexOf(anchor.key) >= 0 ? anchor.key : undefined;
		if (key === undefined) {
			for (let index = anchor.index + 1; index < anchor.order.length; index += 1) {
				const candidate = anchor.order[index]!;
				if (this.indexOf(candidate) >= 0) {
					key = candidate;
					break;
				}
			}
		}
		if (key === undefined) {
			for (
				let index = Math.min(anchor.index - 1, anchor.order.length - 1);
				index >= 0;
				index -= 1
			) {
				const candidate = anchor.order[index]!;
				if (this.indexOf(candidate) >= 0) {
					key = candidate;
					break;
				}
			}
		}
		if (key === undefined) {
			this.#scrollOffset = 0;
			return;
		}
		const item = this.#getLayout().items[this.indexOf(key)]!;
		const offsetWithin = Math.min(anchor.offsetWithin, Math.max(0, item.size));
		this.#scrollOffset = item.start + offsetWithin;
		this.#clampScrollOffset();
	}

	#clampScrollOffset(): void {
		this.#scrollOffset = Math.min(this.#maximumScrollOffset(), Math.max(0, this.#scrollOffset));
	}

	#maximumScrollOffset(): number {
		return Math.max(0, this.#getLayout().totalSize - this.#viewportSize);
	}

	#getLayout(): VirtualLayout<TKey> {
		if (this.#layout) return this.#layout;
		const starts: number[] = [];
		const ends: number[] = [];
		const items: KeyedVirtualItem<TKey>[] = [];
		let start = 0;
		for (let index = 0; index < this.#keys.length; index += 1) {
			const key = this.#keys[index]!;
			const measuredSize = this.#measurements.get(key);
			const estimatedSize =
				typeof this.#estimateSize === 'number'
					? this.#estimateSize
					: this.#estimateSize(key, index);
			const size =
				measuredSize ??
				finiteSize(estimatedSize, `Keyed virtualizer estimate for ${formatSelectionKey(key)}`);
			const end = start + size;
			starts.push(start);
			ends.push(end);
			items.push(
				Object.freeze({
					end,
					index,
					key,
					measured: measuredSize !== undefined,
					size,
					start
				})
			);
			start = end;
		}
		this.#layout = Object.freeze({
			ends: Object.freeze(ends),
			items: Object.freeze(items),
			starts: Object.freeze(starts),
			totalSize: start
		});
		return this.#layout;
	}
}
