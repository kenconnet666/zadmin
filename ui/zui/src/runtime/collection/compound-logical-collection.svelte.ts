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
	// Lifecycle ownership stays imperative. Multiple child effects can register or clean
	// up in one Svelte flush; rebuilding a $state array from an effect-local snapshot can
	// overwrite siblings. The revision is only a reactive invalidation signal.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- token lifecycle ownership is imperative; revision publishes changes.
	readonly #registrations = new Map<symbol, CompoundRegistration<TItem>>();
	#revision = $state(0);
	#nextRevision = 0;

	constructor(mounted: MountedElements<TKey>) {
		this.#mounted = mounted;
	}

	get collection(): LogicalCollection<TKey, TItem> {
		this.#revision;
		const values = [...this.#registrations.values()].map(({ read }) => read());
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
		// Sort order is a getter-local snapshot, not a persistent reactive collection.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
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
		this.#registrations.set(token, registration);
		this.#revision = ++this.#nextRevision;
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			if (this.#registrations.delete(token)) this.#revision = ++this.#nextRevision;
		};
	}
}
