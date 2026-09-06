/**
 * Gives a newly mounted surface one painted closed frame before entering.
 * Presence owns mounting and exit timers; this controller owns only entry frames.
 * Initially open SSR content stays entered, and reopening a retained exiting
 * element reverses its existing transition without painting a new closed frame.
 */
export class PresenceEntryMotion {
	#entered = $state(false);
	#firstFrame: number | undefined;
	#secondFrame: number | undefined;
	#view: Window | undefined;
	#wasOpen: boolean;
	#element: HTMLElement | null = null;
	#generation = 0;

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
		if (!open) {
			this.#cancelFrames();
			this.#entered = false;
			this.#wasOpen = false;
			this.#element = element;
			return;
		}
		const retained = !this.#wasOpen && element !== null && element === this.#element;
		this.#wasOpen = true;
		if (reducedMotion || this.#entered || retained) {
			this.#cancelFrames();
			this.#entered = true;
			this.#element = element;
			return;
		}
		const view = element?.ownerDocument.defaultView ?? undefined;
		if (
			view === this.#view &&
			element === this.#element &&
			(this.#firstFrame !== undefined || this.#secondFrame !== undefined)
		)
			return;
		this.#cancelFrames();
		this.#element = element;
		if (!view || typeof view.requestAnimationFrame !== 'function') {
			if (!element) return;
			this.#entered = true;
			return;
		}
		this.#view = view;
		const generation = this.#generation;
		this.#firstFrame = view.requestAnimationFrame(() => {
			if (generation !== this.#generation) return;
			this.#firstFrame = undefined;
			this.#secondFrame = view.requestAnimationFrame(() => {
				if (generation !== this.#generation) return;
				this.#secondFrame = undefined;
				this.#entered = true;
			});
		});
	}

	#cancelFrames(): void {
		this.#generation += 1;
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
