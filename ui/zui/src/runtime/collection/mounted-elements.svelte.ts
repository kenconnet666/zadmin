import { untrack } from 'svelte';
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
	readonly detachFocusTracking: () => void;
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
	#focusedKey: TKey | undefined;
	#focusGeneration = 0;

	get size(): number {
		return this.#records.size;
	}

	mount(key: TKey, element: TElement, id: string): () => void {
		const token = Symbol('zui-mounted-element');
		const previous = untrack(() => this.#records.get(key));
		previous?.detachFocusTracking();
		const handleFocus = () => {
			this.#focusedKey = key;
		};
		const handleBlur = (event: FocusEvent) => {
			const relatedTarget = event.relatedTarget;
			if (relatedTarget !== null) {
				const next = this.#keyForTarget(relatedTarget);
				this.#focusedKey = next;
				return;
			}
			element.ownerDocument.defaultView?.queueMicrotask(() => {
				if (
					this.#records.get(key)?.token === token &&
					element.isConnected &&
					element.ownerDocument.activeElement !== element
				) {
					this.#focusedKey = undefined;
				}
			});
		};
		element.addEventListener('focus', handleFocus);
		element.addEventListener('blur', handleBlur);
		const detachFocusTracking = () => {
			element.removeEventListener('focus', handleFocus);
			element.removeEventListener('blur', handleBlur);
		};
		this.#records.set(key, { detachFocusTracking, element, id, key, token });
		if (element.ownerDocument.activeElement === element) this.#focusedKey = key;
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			detachFocusTracking();
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
		this.#focusGeneration += 1;
		const record = this.#records.get(key);
		return record ? this.#focusRecord(record, options) : false;
	}

	/** Schedules focus while invalidating every older queued request and replaced element token. */
	scheduleFocus(key: TKey, options: FocusOptions = { preventScroll: true }): boolean {
		const record = this.#records.get(key);
		if (!record) return false;
		const generation = (this.#focusGeneration += 1);
		const run = () => {
			if (generation !== this.#focusGeneration || this.#records.get(key)?.token !== record.token)
				return;
			this.#focusRecord(record, options);
		};
		const ownerWindow = record.element.ownerDocument.defaultView;
		if (ownerWindow) ownerWindow.queueMicrotask(run);
		else queueMicrotask(run);
		return true;
	}

	#focusRecord(record: MountedElementRegistration<TKey, TElement>, options: FocusOptions): boolean {
		const { element, key } = record;
		element.focus(options);
		const focused = element.ownerDocument.activeElement === element;
		if (focused) this.#focusedKey = key;
		return focused;
	}

	/** True when this key most recently owned focus, including the removal blur gap. */
	ownsFocus(key: TKey): boolean {
		if (!Object.is(this.#focusedKey, key)) return false;
		const record = this.#records.get(key);
		if (!record) return true;
		const ownerDocument = record.element.ownerDocument;
		const activeElement = ownerDocument.activeElement;
		if (
			activeElement !== null &&
			activeElement !== ownerDocument.body &&
			activeElement !== ownerDocument.documentElement
		)
			return activeElement === record.element || record.element.contains(activeElement);
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
		this.#focusGeneration += 1;
		for (const record of this.#records.values()) record.detachFocusTracking();
		this.#records.clear();
		this.#focusedKey = undefined;
	}

	#keyForTarget(target: EventTarget): TKey | undefined {
		for (const [key, { element }] of this.#records) {
			if (target === element) return key;
		}
		return undefined;
	}
}
