import { getLayerStack, type LayerRegistration, type LayerStack } from './layer-stack.svelte.js';

export type DismissReason = 'escape' | 'focus-outside' | 'pointer-outside';

export class DismissableLayerEvent<TEvent extends Event> {
	defaultPrevented = false;

	constructor(
		readonly originalEvent: TEvent,
		readonly reason: DismissReason
	) {}

	preventDefault(): void {
		this.defaultPrevented = true;
	}
}

export interface DismissableLayerOptions {
	readonly id?: string;
	readonly modal?: () => boolean;
	readonly onDismiss: (reason: DismissReason) => void;
	readonly onEscape?: (event: DismissableLayerEvent<KeyboardEvent>) => void;
	readonly onFocusOutside?: (event: DismissableLayerEvent<FocusEvent>) => void;
	readonly onPointerOutside?: (event: DismissableLayerEvent<PointerEvent>) => void;
	readonly parentId?: () => string | undefined;
	readonly stack?: LayerStack;
}

export class DismissableLayer {
	readonly #document: Document;
	readonly #options: DismissableLayerOptions;
	readonly #registration: LayerRegistration;

	constructor(root: HTMLElement, options: DismissableLayerOptions) {
		this.#document = root.ownerDocument;
		this.#options = options;
		const stack = options.stack ?? getLayerStack(this.#document);
		this.#registration = stack.register({
			element: () => root,
			id: options.id,
			modal: options.modal,
			parentId: options.parentId
		});
		this.#document.addEventListener('pointerdown', this.#handlePointer, true);
		this.#document.addEventListener('focusin', this.#handleFocus, true);
		this.#document.addEventListener('keydown', this.#handleKey, true);
	}

	get id(): string {
		return this.#registration.id;
	}

	registerBranch(element: HTMLElement): () => void {
		return this.#registration.registerBranch(element);
	}

	destroy(): void {
		this.#document.removeEventListener('pointerdown', this.#handlePointer, true);
		this.#document.removeEventListener('focusin', this.#handleFocus, true);
		this.#document.removeEventListener('keydown', this.#handleKey, true);
		this.#registration.destroy();
	}

	readonly #handleFocus = (originalEvent: FocusEvent) => {
		if (!this.#isTopmostOutside(originalEvent.target)) return;
		const event = new DismissableLayerEvent(originalEvent, 'focus-outside');
		this.#options.onFocusOutside?.(event);
		if (!event.defaultPrevented) this.#options.onDismiss(event.reason);
	};

	readonly #handleKey = (originalEvent: KeyboardEvent) => {
		const stack = this.#options.stack ?? getLayerStack(this.#document);
		if (originalEvent.key !== 'Escape' || !stack.isTopmost(this.id)) return;
		const event = new DismissableLayerEvent(originalEvent, 'escape');
		this.#options.onEscape?.(event);
		if (!event.defaultPrevented) {
			originalEvent.preventDefault();
			this.#options.onDismiss(event.reason);
		}
	};

	readonly #handlePointer = (originalEvent: PointerEvent) => {
		if (!this.#isTopmostOutside(originalEvent.target)) return;
		const event = new DismissableLayerEvent(originalEvent, 'pointer-outside');
		this.#options.onPointerOutside?.(event);
		if (!event.defaultPrevented) this.#options.onDismiss(event.reason);
	};

	#isTopmostOutside(target: EventTarget | null): target is Node {
		const stack = this.#options.stack ?? getLayerStack(this.#document);
		return target instanceof Node && stack.isTopmost(this.id) && !stack.contains(this.id, target);
	}
}
