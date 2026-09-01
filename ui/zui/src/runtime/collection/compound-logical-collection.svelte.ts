import { untrack } from 'svelte';

import { LogicalCollection } from './logical-collection.js';
import type { MountedElements } from './mounted-elements.svelte.js';
import type { SelectionKey } from './selection.js';

export interface CompoundLogicalCollectionItem<TKey extends SelectionKey = SelectionKey> {
	readonly disabled?: boolean;
	readonly groupKey?: string;
	readonly key: TKey;
	readonly selectionDisabled?: boolean;
	readonly textValue: string;
}

interface CompoundRegistration<TItem> {
	readonly read: () => TItem;
	readonly token: symbol;
}

/**
 * Compatibility source for non-virtual compound collections.
 *
 * Data-backed components must construct LogicalCollection directly. This registry
 * exists only for legacy compound children whose logical metadata cannot be known
 * before they mount. MountedElements may correct their DOM order, but never owns
 * their disabled, grouping, text, or selection metadata.
 */
export class CompoundLogicalCollectionRegistry<
	TKey extends SelectionKey,
	TItem extends CompoundLogicalCollectionItem<TKey>
> {
	readonly #mounted: MountedElements<TKey>;
	#registrations = $state<readonly CompoundRegistration<TItem>[]>([]);

	constructor(mounted: MountedElements<TKey>) {
		this.#mounted = mounted;
	}

	get collection(): LogicalCollection<TKey, TItem> {
		const values = this.#registrations.map(({ read }) => read());
		const source = new LogicalCollection<TKey, TItem>(
			values,
			{
				disabled: (item) => item.disabled ?? false,
				groupKey: (item) => item.groupKey,
				key: (item) => item.key,
				selectionDisabled: (item) => item.selectionDisabled ?? false,
				textValue: (item) => item.textValue
			},
			{ name: 'Compound logical collection' }
		);
		const order = new Map(this.#mounted.order(source.full.keys).map((key, index) => [key, index]));
		return new LogicalCollection<TKey, TItem>(
			[...values].sort((left, right) => order.get(left.key)! - order.get(right.key)!),
			{
				disabled: (item) => item.disabled ?? false,
				groupKey: (item) => item.groupKey,
				key: (item) => item.key,
				selectionDisabled: (item) => item.selectionDisabled ?? false,
				textValue: (item) => item.textValue
			},
			{ name: 'Compound logical collection' }
		);
	}

	register(read: () => TItem): () => void {
		const token = Symbol('zui-compound-logical-item');
		const registration = { read, token };
		this.#registrations = [...untrack(() => this.#registrations), registration];
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			this.#registrations = untrack(() => this.#registrations).filter(
				(candidate) => candidate.token !== token
			);
		};
	}
}
