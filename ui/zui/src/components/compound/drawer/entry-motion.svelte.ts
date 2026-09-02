/**
 * Separates Drawer mounting from its entered visual state so a newly mounted
 * panel/backdrop has one painted closed frame before the enter transition.
 */
export class DrawerEntryMotion {
	#entered = $state(false);
	#firstFrame: number | undefined;
	#secondFrame: number | undefined;
	#view: Window | undefined;
	#wasOpen: boolean;

	constructor(initiallyOpen: boolean) {
		this.#entered = initiallyOpen;
		this.#wasOpen = initiallyOpen;
	}

	get entered(): boolean {
		return this.#entered;
	}

	destroy(): void {
		this.#cancelFrames();
	}

	update(open: boolean, reducedMotion: boolean, element: HTMLElement | null): void {
		this.#cancelFrames();
		if (!open) {
			this.#entered = false;
			this.#wasOpen = false;
			return;
		}
		if (reducedMotion || this.#wasOpen) {
			this.#entered = true;
			this.#wasOpen = true;
			return;
		}
		this.#entered = false;
		const view = element?.ownerDocument.defaultView ?? undefined;
		if (!view || typeof view.requestAnimationFrame !== 'function') {
			if (!element) return;
			this.#entered = true;
			this.#wasOpen = true;
			return;
		}
		this.#view = view;
		this.#wasOpen = true;
		this.#firstFrame = view.requestAnimationFrame(() => {
			this.#firstFrame = undefined;
			this.#secondFrame = view.requestAnimationFrame(() => {
				this.#secondFrame = undefined;
				this.#entered = true;
			});
		});
	}

	#cancelFrames(): void {
		if (this.#view && this.#firstFrame !== undefined) {
			this.#view.cancelAnimationFrame(this.#firstFrame);
		}
		if (this.#view && this.#secondFrame !== undefined) {
			this.#view.cancelAnimationFrame(this.#secondFrame);
		}
		this.#firstFrame = undefined;
		this.#secondFrame = undefined;
		this.#view = undefined;
	}
}
