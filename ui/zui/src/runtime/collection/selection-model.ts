import type { LogicalCollection, LogicalCollectionView } from './logical-collection.js';
import type { Selection, SelectionKey, SelectionMode } from './selection.js';

export type SelectionChangeReason =
	'clear' | 'range' | 'reconcile' | 'replace' | 'select-all' | 'toggle';

export interface SelectionChange<TKey extends SelectionKey> {
	readonly anchorKey?: TKey;
	readonly currentKey?: TKey;
	readonly key?: TKey;
	readonly reason: SelectionChangeReason;
	readonly selection: Selection<TKey>;
}

export interface SelectionModelOptions<TKey extends SelectionKey, TValue> {
	readonly collection: () => LogicalCollection<TKey, TValue>;
	readonly collectionComplete?: () => boolean;
	readonly disallowEmpty?: () => boolean;
	readonly mode: () => SelectionMode;
	readonly orphanPolicy?: () => 'preserve' | 'prune-when-complete';
	readonly read: () => Selection<TKey>;
	readonly selectAllScope?: () => 'full' | 'view';
	readonly view: () => LogicalCollectionView<TKey, TValue>;
	readonly write: (change: SelectionChange<TKey>) => void;
}

function equalSelection<TKey extends SelectionKey>(
	left: Selection<TKey>,
	right: Selection<TKey>
): boolean {
	if (left === right) return true;
	if (left === 'all' || right === 'all' || left.size !== right.size) return false;
	for (const key of left) if (!right.has(key)) return false;
	return true;
}

/** Selection policy over logical keys. It does not own controlled/uncontrolled state. */
export class SelectionModel<TKey extends SelectionKey, TValue> {
	readonly #options: SelectionModelOptions<TKey, TValue>;
	#anchorKey: TKey | undefined;
	#currentKey: TKey | undefined;

	constructor(options: SelectionModelOptions<TKey, TValue>) {
		this.#options = options;
	}

	get anchorKey(): TKey | undefined {
		return this.#anchorKey;
	}

	get currentKey(): TKey | undefined {
		return this.#currentKey;
	}

	isSelected(key: TKey): boolean {
		if (this.#options.mode() === 'none') return false;
		const selection = this.#options.read();
		if (selection !== 'all') return selection.has(key);
		const item = this.#options.collection().get(key);
		return item === undefined || (!item.disabled && !item.selectionDisabled);
	}

	canSelect(key: TKey): boolean {
		if (this.#options.mode() === 'none') return false;
		const item = this.#options.collection().get(key);
		return item !== undefined && !item.disabled && !item.selectionDisabled;
	}

	replace(key: TKey): boolean {
		if (!this.canSelect(key)) return false;
		this.#anchorKey = key;
		this.#currentKey = key;
		return this.#commit(new Set([key]), 'replace', key);
	}

	toggle(key: TKey): boolean {
		if (!this.canSelect(key)) return false;
		const mode = this.#options.mode();
		if (mode === 'single' && !this.isSelected(key)) return this.replace(key);
		const next = this.#materialize(this.#options.read());
		if (next.has(key)) {
			if ((this.#options.disallowEmpty?.() ?? false) && next.size === 1) return false;
			next.delete(key);
		} else {
			if (mode === 'single') next.clear();
			next.add(key);
		}
		this.#anchorKey = key;
		this.#currentKey = key;
		return this.#commit(next, 'toggle', key);
	}

	extend(to: TKey): boolean {
		if (this.#options.mode() === 'none' || !this.canSelect(to)) return false;
		if (this.#options.mode() === 'single') return this.replace(to);
		const view = this.#options.view();
		const anchor = this.#anchorKey ?? this.#currentKey ?? to;
		const next = this.#materialize(this.#options.read());
		if (this.#currentKey !== undefined) {
			for (const key of view.range(anchor, this.#currentKey)) next.delete(key);
		}
		for (const key of view.range(anchor, to)) if (this.canSelect(key)) next.add(key);
		this.#anchorKey = anchor;
		this.#currentKey = to;
		return this.#commit(next, 'range', to);
	}

	selectAll(): boolean {
		if (this.#options.mode() !== 'multiple') return false;
		if ((this.#options.selectAllScope?.() ?? 'full') === 'full') {
			return this.#commit('all', 'select-all');
		}
		const keys = this.#options.view().keys.filter((key) => this.canSelect(key));
		return this.#commit(new Set(keys), 'select-all');
	}

	clear(): boolean {
		if (this.#options.disallowEmpty?.()) return false;
		this.resetTransient();
		return this.#commit(new Set(), 'clear');
	}

	reconcile(): boolean {
		if (
			(this.#options.orphanPolicy?.() ?? 'preserve') !== 'prune-when-complete' ||
			!this.#options.collectionComplete?.()
		) {
			return false;
		}
		const current = this.#options.read();
		if (current === 'all') return false;
		const collection = this.#options.collection();
		const next = new Set([...current].filter((key) => collection.get(key) !== undefined));
		return this.#commit(next, 'reconcile');
	}

	resetTransient(): void {
		this.#anchorKey = undefined;
		this.#currentKey = undefined;
	}

	#materialize(selection: Selection<TKey>): Set<TKey> {
		if (selection !== 'all') return new Set(selection);
		return new Set(this.#options.collection().full.keys.filter((key) => this.canSelect(key)));
	}

	#commit(selection: Selection<TKey>, reason: SelectionChangeReason, key?: TKey): boolean {
		if (equalSelection(this.#options.read(), selection)) return false;
		this.#options.write({
			anchorKey: this.#anchorKey,
			currentKey: this.#currentKey,
			key,
			reason,
			selection
		});
		return true;
	}
}
