import { tabbable } from 'tabbable';

import {
	containsComposedNode,
	getActiveElement,
	isDomHtmlElement,
	isDomNode
} from './dom-realm.js';

export interface FocusScopeOptions {
	/** Interactive branches that belong to the scope without being DOM descendants of its container. */
	readonly branches?: () => readonly HTMLElement[];
	readonly initialFocus?: () => HTMLElement | null;
	readonly restoreFocus?: boolean;
	readonly restoreTarget?: () => HTMLElement | null;
	readonly trap?: boolean;
}

const scopeStacks = new WeakMap<Document, FocusScope[]>();

function stackFor(ownerDocument: Document): FocusScope[] {
	let stack = scopeStacks.get(ownerDocument);
	if (!stack) {
		stack = [];
		scopeStacks.set(ownerDocument, stack);
	}
	return stack;
}

export class FocusScope {
	readonly #container: HTMLElement;
	readonly #document: Document;
	readonly #options: FocusScopeOptions;
	readonly #previousFocus: HTMLElement | null;
	#active = true;

	constructor(container: HTMLElement, options: FocusScopeOptions = {}) {
		this.#container = container;
		this.#document = container.ownerDocument;
		this.#options = options;
		const previous = getActiveElement(container);
		this.#previousFocus = isDomHtmlElement(previous) ? previous : null;
		stackFor(this.#document).push(this);
		this.#document.addEventListener('keydown', this.#handleKey, true);
		this.#document.addEventListener('focusin', this.#handleFocus, true);
		(this.#document.defaultView ?? globalThis).queueMicrotask(() => {
			if (!this.#active || !this.#isTopmost()) return;
			const target = this.#options.initialFocus?.() ?? this.#candidates()[0] ?? this.#container;
			target.focus({ preventScroll: true });
		});
	}

	destroy(): void {
		if (!this.#active) return;
		this.#active = false;
		this.#document.removeEventListener('keydown', this.#handleKey, true);
		this.#document.removeEventListener('focusin', this.#handleFocus, true);
		const stack = stackFor(this.#document);
		const index = stack.indexOf(this);
		if (index >= 0) stack.splice(index, 1);
		if (this.#options.restoreFocus === false) return;
		const restoreTarget = this.#options.restoreTarget?.() ?? this.#previousFocus;
		if (restoreTarget?.isConnected) {
			restoreTarget.focus({ preventScroll: true });
			if (containsComposedNode(restoreTarget, getActiveElement(restoreTarget))) {
				return;
			}
		}
		if (this.#previousFocus !== restoreTarget && this.#previousFocus?.isConnected) {
			this.#previousFocus.focus({ preventScroll: true });
		}
	}

	readonly #handleFocus = (event: FocusEvent) => {
		if (
			!this.#options.trap ||
			!this.#isTopmost() ||
			this.#contains(getActiveElement(this.#container)) ||
			event.composedPath().some((target) => this.#contains(target))
		) {
			return;
		}
		const target = this.#candidates()[0] ?? this.#container;
		target.focus({ preventScroll: true });
	};

	readonly #handleKey = (event: KeyboardEvent) => {
		if (event.key !== 'Tab' || !this.#options.trap || !this.#isTopmost()) return;
		const candidates = this.#candidates();
		if (candidates.length === 0) {
			event.preventDefault();
			this.#container.focus({ preventScroll: true });
			return;
		}
		const current = getActiveElement(this.#container);
		const index = candidates.indexOf(current as HTMLElement);
		const next = event.shiftKey
			? candidates[index <= 0 ? candidates.length - 1 : index - 1]
			: candidates[index < 0 || index === candidates.length - 1 ? 0 : index + 1];
		event.preventDefault();
		next?.focus({ preventScroll: true });
	};

	#candidates(): ReturnType<typeof tabbable> {
		const options = { getShadowRoot: (element: Element) => element.shadowRoot ?? false };
		const candidates = [...tabbable(this.#container, options)];
		for (const branch of this.#options.branches?.() ?? []) {
			if (branch.ownerDocument !== this.#document || !branch.isConnected) continue;
			for (const candidate of tabbable(branch, { ...options, includeContainer: true })) {
				if (!candidates.includes(candidate)) candidates.push(candidate);
			}
		}
		return candidates;
	}

	#contains(target: unknown): boolean {
		if (!isDomNode(target)) return false;
		return (
			containsComposedNode(this.#container, target) ||
			(this.#options.branches?.() ?? []).some(
				(branch) => branch.ownerDocument === this.#document && containsComposedNode(branch, target)
			)
		);
	}

	#isTopmost(): boolean {
		return stackFor(this.#document).at(-1) === this;
	}
}
