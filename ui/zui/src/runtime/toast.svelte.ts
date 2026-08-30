/* eslint-disable svelte/prefer-svelte-reactivity -- Timers use imperative Map and Set bookkeeping. */
export type ToastDismissReason = 'action' | 'close' | 'programmatic' | 'timeout';
export type ToastPauseReason = 'focus' | 'hover' | 'visibility';
export type ToastPriority = 'assertive' | 'polite';
export type ToastTone = 'danger' | 'info' | 'success' | 'warning';

export interface ToastOptions {
	readonly actionLabel?: string;
	readonly description?: string;
	readonly duration?: number | null;
	readonly id?: string;
	readonly onAction?: (id: string) => void;
	readonly onDismiss?: (id: string, reason: ToastDismissReason) => void;
	readonly priority?: ToastPriority;
	readonly title: string;
	readonly tone?: ToastTone;
}

export interface ToastRecord extends ToastOptions {
	readonly duration: number | null;
	readonly id: string;
	readonly priority: ToastPriority;
	readonly tone: ToastTone;
}

interface ToastTimer {
	handle?: ReturnType<typeof setTimeout>;
	paused: Set<ToastPauseReason>;
	remaining: number;
	startedAt: number;
}

const now = (): number => (typeof performance === 'undefined' ? Date.now() : performance.now());

export class ToastQueue {
	#items = $state<readonly ToastRecord[]>([]);
	#nextId = 0;
	// Timer and pause bookkeeping is imperative lifecycle state, not a rendered collection.
	readonly #timers = new Map<string, ToastTimer>();

	get items(): readonly ToastRecord[] {
		return this.#items;
	}

	push(options: ToastOptions): string {
		const duration = options.duration === undefined ? 5000 : options.duration;
		if (duration !== null && (!Number.isFinite(duration) || duration <= 0)) {
			throw new TypeError('Toast duration must be null or a positive finite number.');
		}
		const id = options.id ?? `toast-${++this.#nextId}`;
		const record = Object.freeze({
			...options,
			duration,
			id,
			priority: options.priority ?? (options.tone === 'danger' ? 'assertive' : 'polite'),
			tone: options.tone ?? 'info'
		}) satisfies ToastRecord;
		const index = this.#items.findIndex((item) => item.id === id);
		this.#items = Object.freeze(
			index === -1
				? [...this.#items, record]
				: this.#items.map((item, itemIndex) => (itemIndex === index ? record : item))
		);
		this.#clearTimer(id);
		if (duration !== null) {
			this.#timers.set(id, { paused: new Set(), remaining: duration, startedAt: now() });
			this.#schedule(id);
		}
		return id;
	}

	dismiss(id: string, reason: ToastDismissReason = 'programmatic'): void {
		const item = this.#items.find((candidate) => candidate.id === id);
		if (!item) return;
		this.#clearTimer(id);
		this.#timers.delete(id);
		this.#items = Object.freeze(this.#items.filter((candidate) => candidate.id !== id));
		item.onDismiss?.(id, reason);
	}

	pause(id: string, reason: ToastPauseReason): void {
		const timer = this.#timers.get(id);
		if (!timer || timer.paused.has(reason)) return;
		if (timer.handle !== undefined) {
			clearTimeout(timer.handle);
			timer.handle = undefined;
			timer.remaining = Math.max(0, timer.remaining - (now() - timer.startedAt));
		}
		timer.paused.add(reason);
	}

	resume(id: string, reason: ToastPauseReason): void {
		const timer = this.#timers.get(id);
		if (!timer) return;
		timer.paused.delete(reason);
		if (timer.paused.size === 0) this.#schedule(id);
	}

	pauseAll(reason: ToastPauseReason): void {
		for (const item of this.#items) this.pause(item.id, reason);
	}

	resumeAll(reason: ToastPauseReason): void {
		for (const item of this.#items) this.resume(item.id, reason);
	}

	connectVisibility(): () => void {
		if (typeof document === 'undefined') return () => {};
		const update = (): void => {
			if (document.visibilityState === 'hidden') this.pauseAll('visibility');
			else this.resumeAll('visibility');
		};
		update();
		document.addEventListener('visibilitychange', update);
		return () => document.removeEventListener('visibilitychange', update);
	}

	clear(): void {
		for (const item of [...this.#items]) this.dismiss(item.id, 'programmatic');
	}

	dispose(): void {
		for (const id of this.#timers.keys()) this.#clearTimer(id);
		this.#timers.clear();
	}

	#schedule(id: string): void {
		const timer = this.#timers.get(id);
		if (!timer || timer.handle !== undefined || timer.paused.size > 0) return;
		if (typeof window === 'undefined') return;
		if (timer.remaining <= 0) {
			this.dismiss(id, 'timeout');
			return;
		}
		timer.startedAt = now();
		timer.handle = setTimeout(() => {
			timer.handle = undefined;
			this.dismiss(id, 'timeout');
		}, timer.remaining);
	}

	#clearTimer(id: string): void {
		const timer = this.#timers.get(id);
		if (timer?.handle !== undefined) clearTimeout(timer.handle);
	}
}

export const createToastQueue = (): ToastQueue => new ToastQueue();
