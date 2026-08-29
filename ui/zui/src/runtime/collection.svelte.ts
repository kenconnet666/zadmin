import { SvelteSet } from 'svelte/reactivity';

import type { SelectionKey } from './selection.js';

export interface CollectionItem<TKey extends SelectionKey = SelectionKey> {
	readonly disabled?: boolean;
	readonly element?: HTMLElement | null;
	readonly key: TKey;
	readonly textValue?: string;
}

interface CollectionRegistration<TItem extends CollectionItem> {
	readonly id: number;
	readonly read: () => TItem;
}

function compareDomOrder(left: CollectionItem, right: CollectionItem): number {
	if (!left.element || !right.element || left.element === right.element) return 0;
	const position = left.element.compareDocumentPosition(right.element);
	if ((position & 1) !== 0) return 0;
	if ((position & 4) !== 0) return -1;
	if ((position & 2) !== 0) return 1;
	return 0;
}

export class CollectionStore<TItem extends CollectionItem> {
	#nextId = 0;
	#registrations = $state<readonly CollectionRegistration<TItem>[]>([]);

	get items(): readonly TItem[] {
		const items = this.#registrations.map(({ read }) => read()).sort(compareDomOrder);
		const keys = new SvelteSet<SelectionKey>();
		for (const item of items) {
			if (keys.has(item.key)) throw new Error(`Duplicate collection key "${String(item.key)}".`);
			keys.add(item.key);
		}
		return Object.freeze(items);
	}

	get enabledItems(): readonly TItem[] {
		return this.items.filter(({ disabled }) => !disabled);
	}

	get keys(): readonly TItem['key'][] {
		return this.items.map(({ key }) => key);
	}

	get(key: TItem['key']): TItem | undefined {
		return this.items.find((item) => Object.is(item.key, key));
	}

	register(read: () => TItem): () => void {
		const initial = read();
		if (this.get(initial.key))
			throw new Error(`Duplicate collection key "${String(initial.key)}".`);
		const registration = { id: (this.#nextId += 1), read };
		this.#registrations = [...this.#registrations, registration];
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			this.#registrations = this.#registrations.filter(({ id }) => id !== registration.id);
		};
	}
}
