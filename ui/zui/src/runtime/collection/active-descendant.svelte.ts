import type { MountedElements } from './mounted-elements.svelte.js';
import {
	CollectionNavigation,
	type CollectionNavigationReason
} from './collection-navigation.svelte.js';
import type { NavigationIntent } from './list-navigation.js';
import type { SelectionKey } from './selection.js';

export type ActiveDescendantAlign = 'center' | 'end' | 'nearest' | 'start';

export interface VirtualMountBridge<TKey extends SelectionKey> {
	ensureKey(key: TKey, align?: ActiveDescendantAlign): void;
	isRendered(key: TKey): boolean;
	scrollToKey(key: TKey, align?: ActiveDescendantAlign): void;
}

export interface ActiveDescendantOptions<TKey extends SelectionKey, TValue> {
	readonly idBase: () => string;
	readonly mounted: MountedElements<TKey>;
	readonly navigation: CollectionNavigation<TKey, TValue>;
	readonly virtualizer?: VirtualMountBridge<TKey>;
}

/** Container-focus adapter over CollectionNavigation with opaque, typed-key DOM ids. */
export class ActiveDescendant<TKey extends SelectionKey, TValue> {
	readonly #options: ActiveDescendantOptions<TKey, TValue>;
	readonly #slots = new Map<TKey, number>();
	#nextSlot = 0;

	constructor(options: ActiveDescendantOptions<TKey, TValue>) {
		this.#options = options;
	}

	get activeKey(): TKey | undefined {
		return this.#options.navigation.currentKey;
	}

	get activeId(): string | undefined {
		const key = this.activeKey;
		return key === undefined || !this.#options.mounted.has(key) ? undefined : this.idFor(key);
	}

	idFor(key: TKey): string {
		let slot = this.#slots.get(key);
		if (slot === undefined) {
			slot = this.#nextSlot += 1;
			this.#slots.set(key, slot);
		}
		return `${this.#options.idBase()}-option-${slot}`;
	}

	mount(key: TKey, element: HTMLElement): () => void {
		return this.#options.mounted.mount(key, element, this.idFor(key));
	}

	prune(keys: readonly TKey[]): void {
		const retained = new Set(keys);
		for (const key of this.#slots.keys()) if (!retained.has(key)) this.#slots.delete(key);
	}

	set(key: TKey | undefined, reason: CollectionNavigationReason): boolean {
		const changed = this.#options.navigation.set(key, reason);
		if (key !== undefined && (changed || !this.#options.virtualizer?.isRendered(key))) {
			this.#options.virtualizer?.ensureKey(key, 'nearest');
		}
		return changed;
	}

	move(intent: NavigationIntent): TKey | undefined {
		const key = this.#options.navigation.move(intent);
		if (key !== undefined) this.#options.virtualizer?.ensureKey(key, 'nearest');
		return key;
	}

	handleKey(event: KeyboardEvent): boolean {
		if (!this.#options.navigation.handleKey(event)) return false;
		const key = this.activeKey;
		if (key !== undefined) this.#options.virtualizer?.ensureKey(key, 'nearest');
		return true;
	}

	reconcile(): TKey | undefined {
		const key = this.#options.navigation.reconcile();
		if (key !== undefined) this.#options.virtualizer?.ensureKey(key, 'nearest');
		return key;
	}
}
