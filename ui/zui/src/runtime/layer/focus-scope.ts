import { tabbable } from 'tabbable';

export interface FocusScopeOptions {
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
		this.#previousFocus =
			this.#document.activeElement instanceof HTMLElement ? this.#document.activeElement : null;
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
		const restoreTarget = this.#options.restoreTarget?.() ?? this.#previousFocus;
		if (this.#options.restoreFocus !== false && restoreTarget?.isConnected) {
			restoreTarget.focus({ preventScroll: true });
		}
	}

	readonly #handleFocus = (event: FocusEvent) => {
		if (
			!this.#options.trap ||
			!this.#isTopmost() ||
			this.#container.contains(event.target as Node)
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
		return tabbable(this.#container);
	}

	#isTopmost(): boolean {
		return stackFor(this.#document).at(-1) === this;
	}
}
