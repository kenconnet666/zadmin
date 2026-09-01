import type { SelectionKey } from './selection.js';

export interface LogicalCollectionItem<TKey extends SelectionKey = SelectionKey, TValue = unknown> {
	readonly disabled: boolean;
	readonly groupKey: string | undefined;
	readonly key: TKey;
	readonly selectionDisabled: boolean;
	readonly textValue: string;
	readonly value: TValue;
}

export interface LogicalCollectionGroup<
	TKey extends SelectionKey = SelectionKey,
	TValue = unknown
> {
	readonly items: readonly LogicalCollectionItem<TKey, TValue>[];
	readonly key: string;
}

export interface LogicalCollectionAdapter<TValue, TKey extends SelectionKey> {
	readonly disabled?: (value: TValue) => boolean;
	readonly groupKey?: (value: TValue) => string | undefined;
	readonly key: (value: TValue) => TKey;
	readonly selectionDisabled?: (value: TValue) => boolean;
	readonly textValue: (value: TValue) => string;
}

export interface LogicalCollectionOptions {
	readonly name?: string;
}

export interface LogicalCollectionViewOptions<TKey extends SelectionKey, TValue> {
	readonly include?: (item: LogicalCollectionItem<TKey, TValue>) => boolean;
	readonly keys?: readonly TKey[];
}

function assertKey(key: SelectionKey, name: string): void {
	if (typeof key === 'string') return;
	if (!Number.isFinite(key) || Object.is(key, -0)) {
		throw new TypeError(`${name} keys must be strings or finite numbers other than -0.`);
	}
}

function enabled<TKey extends SelectionKey, TValue>(
	item: LogicalCollectionItem<TKey, TValue> | undefined,
	includeDisabled: boolean
): item is LogicalCollectionItem<TKey, TValue> {
	return item !== undefined && (includeDisabled || !item.disabled);
}

/**
 * Immutable ordered view over a logical collection.
 *
 * A view deliberately contains no DOM references. Filtering and ranking create
 * another view while selection can continue to use the collection's full view.
 */
export class LogicalCollectionView<TKey extends SelectionKey, TValue> {
	readonly #byKey: ReadonlyMap<TKey, LogicalCollectionItem<TKey, TValue>>;
	readonly groups: readonly LogicalCollectionGroup<TKey, TValue>[];
	readonly items: readonly LogicalCollectionItem<TKey, TValue>[];
	readonly keys: readonly TKey[];

	constructor(items: readonly LogicalCollectionItem<TKey, TValue>[]) {
		this.items = Object.freeze([...items]);
		this.keys = Object.freeze(this.items.map(({ key }) => key));
		const byKey = new Map<TKey, LogicalCollectionItem<TKey, TValue>>();
		for (const item of this.items) {
			assertKey(item.key, 'Logical collection view');
			if (byKey.has(item.key)) {
				throw new Error(`Logical collection view contains duplicate key "${String(item.key)}".`);
			}
			byKey.set(item.key, item);
		}
		this.#byKey = byKey;
		const grouped = new Map<string, LogicalCollectionItem<TKey, TValue>[]>();
		for (const item of this.items) {
			const groupKey = item.groupKey ?? '';
			const group = grouped.get(groupKey) ?? [];
			group.push(item);
			grouped.set(groupKey, group);
		}
		this.groups = Object.freeze(
			[...grouped].map(([key, groupItems]) =>
				Object.freeze({ items: Object.freeze(groupItems), key })
			)
		);
	}

	get size(): number {
		return this.items.length;
	}

	[Symbol.iterator](): Iterator<LogicalCollectionItem<TKey, TValue>> {
		return this.items[Symbol.iterator]();
	}

	get(key: TKey): LogicalCollectionItem<TKey, TValue> | undefined {
		return this.#byKey.get(key);
	}

	indexOf(key: TKey): number {
		return this.keys.indexOf(key);
	}

	first(options: { readonly includeDisabled?: boolean } = {}): TKey | undefined {
		return this.items.find((item) => enabled(item, options.includeDisabled ?? false))?.key;
	}

	last(options: { readonly includeDisabled?: boolean } = {}): TKey | undefined {
		const includeDisabled = options.includeDisabled ?? false;
		for (let index = this.items.length - 1; index >= 0; index -= 1) {
			const item = this.items[index];
			if (enabled(item, includeDisabled)) return item.key;
		}
		return undefined;
	}

	next(
		key: TKey | undefined,
		options: { readonly includeDisabled?: boolean; readonly loop?: boolean } = {}
	): TKey | undefined {
		return this.#step(key, 1, options);
	}

	previous(
		key: TKey | undefined,
		options: { readonly includeDisabled?: boolean; readonly loop?: boolean } = {}
	): TKey | undefined {
		return this.#step(key, -1, options);
	}

	range(from: TKey, to: TKey): readonly TKey[] {
		const fromIndex = this.indexOf(from);
		const toIndex = this.indexOf(to);
		if (fromIndex < 0 || toIndex < 0) return Object.freeze([]);
		const start = Math.min(fromIndex, toIndex);
		const end = Math.max(fromIndex, toIndex);
		return Object.freeze(this.keys.slice(start, end + 1));
	}

	#step(
		key: TKey | undefined,
		direction: 1 | -1,
		options: { readonly includeDisabled?: boolean; readonly loop?: boolean }
	): TKey | undefined {
		const includeDisabled = options.includeDisabled ?? false;
		if (this.items.length === 0) return undefined;
		const currentIndex = key === undefined ? -1 : this.indexOf(key);
		if (currentIndex < 0) return direction === 1 ? this.first(options) : this.last(options);
		for (
			let index = currentIndex + direction;
			index >= 0 && index < this.items.length;
			index += direction
		) {
			const item = this.items[index];
			if (enabled(item, includeDisabled)) return item.key;
		}
		if (options.loop) return direction === 1 ? this.first(options) : this.last(options);
		return enabled(this.items[currentIndex], includeDisabled) ? key : undefined;
	}
}

/** A normalized, immutable source collection with cheap derived ordered views. */
export class LogicalCollection<TKey extends SelectionKey, TValue> {
	readonly #byKey: ReadonlyMap<TKey, LogicalCollectionItem<TKey, TValue>>;
	readonly full: LogicalCollectionView<TKey, TValue>;

	constructor(
		values: readonly TValue[],
		adapter: LogicalCollectionAdapter<TValue, TKey>,
		options: LogicalCollectionOptions = {}
	) {
		const name = options.name ?? 'Logical collection';
		const byKey = new Map<TKey, LogicalCollectionItem<TKey, TValue>>();
		const items: LogicalCollectionItem<TKey, TValue>[] = [];
		for (const value of values) {
			const key = adapter.key(value);
			assertKey(key, name);
			if (byKey.has(key)) throw new Error(`Duplicate ${name} key "${String(key)}".`);
			const textValue = adapter.textValue(value);
			if (typeof textValue !== 'string') {
				throw new TypeError(`${name} textValue must be a string.`);
			}
			const item = Object.freeze({
				disabled: adapter.disabled?.(value) ?? false,
				groupKey: adapter.groupKey?.(value),
				key,
				selectionDisabled: adapter.selectionDisabled?.(value) ?? false,
				textValue,
				value
			});
			byKey.set(key, item);
			items.push(item);
		}
		this.#byKey = byKey;
		this.full = new LogicalCollectionView(items);
	}

	get(key: TKey): LogicalCollectionItem<TKey, TValue> | undefined {
		return this.#byKey.get(key);
	}

	view(
		options: LogicalCollectionViewOptions<TKey, TValue> = {}
	): LogicalCollectionView<TKey, TValue> {
		const source = options.keys
			? (() => {
					const seen = new Set<TKey>();
					return options.keys.map((key) => {
						if (seen.has(key)) {
							throw new Error(`Logical collection view contains duplicate key "${String(key)}".`);
						}
						seen.add(key);
						const item = this.#byKey.get(key);
						if (!item)
							throw new Error(`Logical collection view contains unknown key "${String(key)}".`);
						return item;
					});
				})()
			: this.full.items;
		const items = options.include ? source.filter(options.include) : source;
		return new LogicalCollectionView(items);
	}
}
