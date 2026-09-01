import { tabbable } from 'tabbable';

import { isDomHtmlElement, isDomNode } from './dom-realm.js';

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
		this.#previousFocus = isDomHtmlElement(this.#document.activeElement)
			? this.#document.activeElement
			: null;
		stackFor(this.#document).push(this);
		this.#document.addEventListener('keydown', this.#handleKey, true);
		this.#document.addEventListener('focusin', this.#handleFocus, true);
		queueMicrotask(() => {
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
			const active = this.#document.activeElement;
			if (active === restoreTarget || (isDomNode(active) && restoreTarget.contains(active))) {
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
			(isDomNode(event.target) && this.#contains(event.target))
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
		const current = this.#document.activeElement;
		const index = candidates.indexOf(current as HTMLElement);
		const next = event.shiftKey
			? candidates[index <= 0 ? candidates.length - 1 : index - 1]
			: candidates[index < 0 || index === candidates.length - 1 ? 0 : index + 1];
		event.preventDefault();
		next?.focus({ preventScroll: true });
	};

	#candidates(): ReturnType<typeof tabbable> {
		const candidates = [...tabbable(this.#container)];
		for (const branch of this.#options.branches?.() ?? []) {
			if (branch.ownerDocument !== this.#document || !branch.isConnected) continue;
			for (const candidate of tabbable(branch, { includeContainer: true })) {
				if (!candidates.includes(candidate)) candidates.push(candidate);
			}
		}
		return candidates;
	}

	#contains(target: Node): boolean {
		return (
			this.#container.contains(target) ||
			(this.#options.branches?.() ?? []).some(
				(branch) => branch.ownerDocument === this.#document && branch.contains(target)
			)
		);
	}

	#isTopmost(): boolean {
		return stackFor(this.#document).at(-1) === this;
	}
}
