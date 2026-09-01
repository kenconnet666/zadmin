import type { LogicalCollectionItem, LogicalCollectionView } from './logical-collection.js';
import {
	navigationIntent,
	type NavigationDirection,
	type NavigationIntent,
	type NavigationOrientation
} from './list-navigation.js';
import type { SelectionKey } from './selection.js';

export type CollectionNavigationReason =
	'collection-change' | 'filter' | 'keyboard' | 'open' | 'pointer' | 'programmatic';

export interface CollectionNavigationOptions<TKey extends SelectionKey, TValue> {
	readonly direction?: () => NavigationDirection;
	readonly disabled?: () => boolean;
	readonly loop?: () => boolean;
	readonly orientation?: () => NavigationOrientation;
	readonly readActive?: () => TKey | undefined;
	readonly view: () => LogicalCollectionView<TKey, TValue>;
	readonly writeActive?: (key: TKey | undefined, reason: CollectionNavigationReason) => void;
}

export function isKeyboardComposing(
	event: Pick<KeyboardEvent, 'isComposing' | 'keyCode'>
): boolean {
	return event.isComposing || event.keyCode === 229;
}

function navigable<TKey extends SelectionKey, TValue>(
	item: LogicalCollectionItem<TKey, TValue> | undefined
): item is LogicalCollectionItem<TKey, TValue> {
	return item !== undefined && !item.disabled;
}

/** Shared ordered active-key navigation, independent from DOM focus strategy. */
export class CollectionNavigation<TKey extends SelectionKey, TValue> {
	readonly #options: CollectionNavigationOptions<TKey, TValue>;
	#active = $state<TKey>();
	#previousView: LogicalCollectionView<TKey, TValue>;

	constructor(options: CollectionNavigationOptions<TKey, TValue>) {
		this.#options = options;
		this.#previousView = options.view();
	}

	get currentKey(): TKey | undefined {
		if (this.#options.disabled?.()) return undefined;
		const view = this.#options.view();
		const current = this.#readActive();
		return navigable(current === undefined ? undefined : view.get(current)) ? current : undefined;
	}

	set(key: TKey | undefined, reason: CollectionNavigationReason): boolean {
		if (key === undefined) {
			if (this.#readActive() === undefined) return false;
			this.#writeActive(undefined, reason);
			return true;
		}
		if (this.#options.disabled?.() || !navigable(this.#options.view().get(key))) return false;
		if (Object.is(this.#readActive(), key)) return false;
		this.#writeActive(key, reason);
		return true;
	}

	move(intent: NavigationIntent): TKey | undefined {
		if (this.#options.disabled?.()) return undefined;
		const view = this.#options.view();
		const current = this.currentKey;
		const options = { loop: this.#options.loop?.() ?? true };
		const target =
			intent === 'first'
				? view.first()
				: intent === 'last'
					? view.last()
					: intent === 'next'
						? view.next(current, options)
						: view.previous(current, options);
		if (target !== undefined) this.set(target, 'keyboard');
		return target;
	}

	handleKey(event: KeyboardEvent): boolean {
		if (isKeyboardComposing(event)) return false;
		const intent = navigationIntent(
			event.key,
			this.#options.orientation?.() ?? 'both',
			this.#options.direction?.() ?? 'ltr'
		);
		if (!intent) return false;
		event.preventDefault();
		this.move(intent);
		return true;
	}

	reconcile(): TKey | undefined {
		const view = this.#options.view();
		if (this.#options.disabled?.()) {
			this.#previousView = view;
			return undefined;
		}
		const current = this.#readActive();
		if (current !== undefined && navigable(view.get(current))) {
			this.#previousView = view;
			return current;
		}

		let target: TKey | undefined;
		if (current !== undefined) {
			const previousIndex = this.#previousView.indexOf(current);
			if (previousIndex >= 0) {
				for (let index = previousIndex + 1; index < this.#previousView.size; index += 1) {
					const key = this.#previousView.keys[index];
					if (key !== undefined && navigable(view.get(key))) {
						target = key;
						break;
					}
				}
				if (target === undefined) {
					for (let index = previousIndex - 1; index >= 0; index -= 1) {
						const key = this.#previousView.keys[index];
						if (key !== undefined && navigable(view.get(key))) {
							target = key;
							break;
						}
					}
				}
			}
		}
		target ??= view.first();
		if (!Object.is(current, target)) this.#writeActive(target, 'collection-change');
		this.#previousView = view;
		return target;
	}

	#readActive(): TKey | undefined {
		return this.#options.readActive ? this.#options.readActive() : this.#active;
	}

	#writeActive(key: TKey | undefined, reason: CollectionNavigationReason): void {
		this.#active = key;
		this.#options.writeActive?.(key, reason);
	}
}
