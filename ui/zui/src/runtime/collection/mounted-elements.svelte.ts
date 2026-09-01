import { SvelteMap } from 'svelte/reactivity';

import type { SelectionKey } from './selection.js';

export interface MountedElementRecord<
	TKey extends SelectionKey = SelectionKey,
	TElement extends HTMLElement = HTMLElement
> {
	readonly element: TElement;
	readonly id: string;
	readonly key: TKey;
}

interface MountedElementRegistration<
	TKey extends SelectionKey,
	TElement extends HTMLElement
> extends MountedElementRecord<TKey, TElement> {
	readonly token: symbol;
}

function compareElements(left: HTMLElement, right: HTMLElement): number {
	if (left === right || left.ownerDocument !== right.ownerDocument) return 0;
	const position = left.compareDocumentPosition(right);
	if ((position & 1) !== 0) return 0;
	if ((position & 4) !== 0) return -1;
	if ((position & 2) !== 0) return 1;
	return 0;
}

/** Reactive registry for currently rendered elements. It never owns logical items. */
export class MountedElements<
	TKey extends SelectionKey,
	TElement extends HTMLElement = HTMLElement
> {
	readonly #records = new SvelteMap<TKey, MountedElementRegistration<TKey, TElement>>();

	get size(): number {
		return this.#records.size;
	}

	mount(key: TKey, element: TElement, id: string): () => void {
		const token = Symbol('zui-mounted-element');
		this.#records.set(key, { element, id, key, token });
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			if (this.#records.get(key)?.token === token) this.#records.delete(key);
		};
	}

	get(key: TKey): MountedElementRecord<TKey, TElement> | undefined {
		return this.#records.get(key);
	}

	has(key: TKey): boolean {
		return this.#records.has(key);
	}

	focus(key: TKey, options: FocusOptions = { preventScroll: true }): boolean {
		const element = this.#records.get(key)?.element;
		if (!element) return false;
		element.focus(options);
		return true;
	}

	order(keys: readonly TKey[]): readonly TKey[] {
		return Object.freeze(
			keys
				.map((key, index) => ({ index, key, record: this.#records.get(key) }))
				.sort((left, right) => {
					if (!left.record || !right.record) return left.index - right.index;
					return (
						compareElements(left.record.element, right.record.element) || left.index - right.index
					);
				})
				.map(({ key }) => key)
		);
	}

	clear(): void {
		this.#records.clear();
	}
}
