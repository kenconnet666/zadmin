import type { CollectionItem, CollectionStore } from './collection.svelte.js';
import {
	moveIndex,
	navigationIntent,
	type NavigationDirection,
	type NavigationOrientation
} from './list-navigation.js';
import type { SelectionKey } from './selection.js';

export interface RovingFocusOptions<TKey extends SelectionKey, TItem extends CollectionItem<TKey>> {
	readonly collection: CollectionStore<TItem>;
	readonly direction?: () => NavigationDirection;
	readonly loop?: () => boolean;
	readonly orientation?: () => NavigationOrientation;
	readonly read: () => TKey | undefined;
	readonly write: (key: TKey) => void;
}

export class RovingFocus<TKey extends SelectionKey, TItem extends CollectionItem<TKey>> {
	readonly #options: RovingFocusOptions<TKey, TItem>;

	constructor(options: RovingFocusOptions<TKey, TItem>) {
		this.#options = options;
	}

	get currentKey(): TKey | undefined {
		const items = this.#options.collection.enabledItems;
		const current = this.#options.read();
		return items.some(({ key }) => Object.is(key, current)) ? current : items[0]?.key;
	}

	tabIndex(key: TKey): 0 | -1 {
		return Object.is(this.currentKey, key) ? 0 : -1;
	}

	set(key: TKey, focus = false): boolean {
		const item = this.#options.collection.enabledItems.find((candidate) =>
			Object.is(candidate.key, key)
		);
		if (!item) return false;
		this.#options.write(item.key);
		if (focus) item.element?.focus({ preventScroll: true });
		return true;
	}

	move(key: string): TKey | undefined {
		const intent = navigationIntent(
			key,
			this.#options.orientation?.() ?? 'both',
			this.#options.direction?.() ?? 'ltr'
		);
		if (!intent) return undefined;
		const items = this.#options.collection.enabledItems;
		const current = items.findIndex((item) => Object.is(item.key, this.currentKey));
		const index = moveIndex(items.length, current, intent, this.#options.loop?.() ?? true);
		const target = items[index];
		if (target) this.set(target.key, true);
		return target?.key;
	}

	handleKey(event: KeyboardEvent): TKey | undefined {
		const target = this.move(event.key);
		if (target !== undefined) event.preventDefault();
		return target;
	}
}
