export const DEFAULT_CLIPBOARD_TIMEOUT = 2000;

export type ClipboardStatus = 'idle' | 'copying' | 'copied' | 'failed';
export interface ClipboardSnapshot {
	readonly status: ClipboardStatus;
	readonly error: unknown | null;
}
export type ClipboardCopyResult =
	| { readonly status: 'copied'; readonly value: string }
	| { readonly status: 'failed'; readonly value: string; readonly error: unknown }
	| { readonly status: 'stale'; readonly value: string };
export interface ClipboardControllerOptions {
	readonly getWindow: () => Window | null | undefined;
	readonly timeout?: number;
}

const IDLE: ClipboardSnapshot = Object.freeze({ status: 'idle', error: null });

/** Owns write feedback only. It never reads the clipboard or claims to cancel a native write. */
export class ClipboardController {
	readonly #options: ClipboardControllerOptions;
	#snapshot = $state.raw<ClipboardSnapshot>(IDLE);
	#generation = 0;
	#destroyed = false;
	#timer: number | undefined;
	#timerWindow: Window | undefined;

	constructor(options: ClipboardControllerOptions) {
		this.#options = options;
	}
	get snapshot(): ClipboardSnapshot {
		return this.#snapshot;
	}
	get status(): ClipboardStatus {
		return this.#snapshot.status;
	}
	get copied(): boolean {
		return this.status === 'copied';
	}
	get pending(): boolean {
		return this.status === 'copying';
	}
	get error(): unknown | null {
		return this.#snapshot.error;
	}

	async copy(
		value: string,
		timeout = this.#options.timeout ?? DEFAULT_CLIPBOARD_TIMEOUT
	): Promise<ClipboardCopyResult> {
		if (typeof value !== 'string') throw new TypeError('Clipboard value must be a string.');
		if (!Number.isFinite(timeout) || timeout < 0)
			throw new TypeError('Clipboard timeout must be non-negative and finite.');
		if (this.#destroyed) return Object.freeze({ status: 'stale', value });
		this.#clearTimer();
		const generation = ++this.#generation;
		this.#snapshot = Object.freeze({ status: 'copying', error: null });
		let owner: Window | null | undefined;
		let result: Exclude<ClipboardCopyResult, { status: 'stale' }>;
		try {
			owner = this.#options.getWindow();
			const clipboard = owner?.navigator.clipboard;
			if (!clipboard?.writeText)
				throw new Error('Clipboard writing is unavailable in this window.');
			// Invoke immediately in the caller's user gesture; do not await anything first.
			await clipboard.writeText(value);
			result = Object.freeze({ status: 'copied', value });
		} catch (error) {
			result = Object.freeze({ status: 'failed', value, error });
		}
		let sameOwner = false;
		try {
			sameOwner = this.#options.getWindow() === owner;
		} catch {
			/* An inaccessible owner invalidates feedback. */
		}
		if (generation !== this.#generation || this.#destroyed)
			return Object.freeze({ status: 'stale', value });
		if (!sameOwner) {
			this.reset();
			return Object.freeze({ status: 'stale', value });
		}
		this.#snapshot = Object.freeze({
			status: result.status,
			error: result.status === 'failed' ? result.error : null
		});
		if (owner && timeout > 0) {
			this.#timerWindow = owner;
			this.#timer = owner.setTimeout(() => {
				if (generation !== this.#generation || this.#destroyed) return;
				this.#clearTimer();
				this.#snapshot = IDLE;
			}, timeout);
		}
		return result;
	}
	reset(): void {
		this.#generation += 1;
		this.#clearTimer();
		this.#snapshot = IDLE;
	}
	destroy(): void {
		this.#destroyed = true;
		this.reset();
	}
	#clearTimer(): void {
		if (this.#timer !== undefined) this.#timerWindow?.clearTimeout(this.#timer);
		this.#timer = undefined;
		this.#timerWindow = undefined;
	}
}
