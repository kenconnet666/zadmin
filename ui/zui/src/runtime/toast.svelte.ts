/* eslint-disable svelte/prefer-svelte-reactivity -- Timers use imperative Map and Set bookkeeping. */
export type ToastDismissReason = 'action' | 'close' | 'programmatic' | 'timeout';
export type ToastPhase = 'exiting' | 'queued' | 'visible';
export type ToastPauseReason = 'focus' | 'hover' | 'visibility';
export type ToastPriority = 'assertive' | 'polite';
export type ToastTone = 'danger' | 'info' | 'success' | 'warning';

export interface ToastQueueOptions {
	readonly maxVisible?: number;
}

export interface ToastOptions {
	readonly actionLabel?: string;
	readonly description?: string;
	readonly dismissLabel?: string;
	readonly dismissible?: boolean;
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
	readonly phase: ToastPhase;
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

function normalizeMaxVisible(value: number): number {
	if (!Number.isInteger(value) || value < 1) {
		throw new TypeError('Toast maxVisible must be a positive integer.');
	}
	return value;
}

export class ToastQueue {
	#connections = 0;
	readonly #globalPauses = new Set<ToastPauseReason>();
	#items = $state<readonly ToastRecord[]>([]);
	#maxVisible: number;
	#nextId = 0;
	// Timer and pause bookkeeping is imperative lifecycle state, not a rendered collection.
	readonly #timers = new Map<string, ToastTimer>();

	constructor(options: ToastQueueOptions = {}) {
		this.#maxVisible = normalizeMaxVisible(options.maxVisible ?? 3);
	}

	get items(): readonly ToastRecord[] {
		return this.#items;
	}

	get presentedItems(): readonly ToastRecord[] {
		return this.#items.filter((item) => item.phase !== 'queued');
	}

	get queuedCount(): number {
		return this.#items.filter((item) => item.phase === 'queued').length;
	}

	push(options: ToastOptions): string {
		const duration = options.duration === undefined ? 5000 : options.duration;
		if (duration !== null && (!Number.isFinite(duration) || duration <= 0)) {
			throw new TypeError('Toast duration must be null or a positive finite number.');
		}
		if (options.id !== undefined && options.id.length === 0) {
			throw new TypeError('Toast id must not be empty.');
		}
		let id = options.id;
		if (id === undefined) {
			do id = `toast-${++this.#nextId}`;
			while (this.#items.some((item) => item.id === id));
		}
		const index = this.#items.findIndex((item) => item.id === id);
		const previous = index === -1 ? undefined : this.#items[index];
		const previousPauses = this.#timers.get(id)?.paused;
		const phase = previous?.phase === 'exiting' ? 'visible' : (previous?.phase ?? 'queued');
		const record = Object.freeze({
			...options,
			duration,
			id,
			phase,
			priority: options.priority ?? (options.tone === 'danger' ? 'assertive' : 'polite'),
			tone: options.tone ?? 'info'
		}) satisfies ToastRecord;
		this.#items = Object.freeze(
			index === -1
				? [...this.#items, record]
				: this.#items.map((item, itemIndex) => (itemIndex === index ? record : item))
		);
		this.#deleteTimer(id);
		if (phase === 'visible') this.#startTimer(record, previousPauses);
		this.#promote();
		return id;
	}

	dismiss(id: string, reason: ToastDismissReason = 'programmatic'): void {
		const item = this.#items.find((candidate) => candidate.id === id);
		if (!item || item.phase === 'exiting') return;
		this.#deleteTimer(id);
		if (item.phase === 'visible' && this.#connections > 0) {
			this.#setPhase(id, 'exiting');
		} else {
			this.#remove(id);
			this.#promote();
		}
		item.onDismiss?.(id, reason);
	}

	completeExit(id: string): void {
		const item = this.#items.find((candidate) => candidate.id === id);
		if (item?.phase !== 'exiting') return;
		this.#remove(id);
		this.#promote();
	}

	setMaxVisible(value: number): void {
		this.#maxVisible = normalizeMaxVisible(value);
		this.#demoteOverflow();
		this.#promote();
	}

	connectViewport(maxVisible = this.#maxVisible): () => void {
		if (this.#connections > 0) {
			throw new Error('ToastQueue can only be connected to one ZToaster viewport.');
		}
		this.setMaxVisible(maxVisible);
		this.#connections = 1;
		for (const item of this.#items) {
			if (item.phase === 'visible') this.#ensureTimer(item);
		}
		let connected = true;
		return () => {
			if (!connected) return;
			connected = false;
			this.#connections = 0;
			for (const timer of this.#timers.values()) this.#stopTimer(timer);
		};
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
		this.#globalPauses.add(reason);
		for (const item of this.#items) {
			if (item.phase === 'visible') this.pause(item.id, reason);
		}
	}

	resumeAll(reason: ToastPauseReason): void {
		this.#globalPauses.delete(reason);
		for (const item of this.#items) {
			if (item.phase === 'visible') this.resume(item.id, reason);
		}
	}

	connectVisibility(
		ownerDocument = typeof document === 'undefined' ? undefined : document
	): () => void {
		if (!ownerDocument) return () => {};
		const update = (): void => {
			if (ownerDocument.visibilityState === 'hidden') this.pauseAll('visibility');
			else this.resumeAll('visibility');
		};
		update();
		ownerDocument.addEventListener('visibilitychange', update);
		return () => ownerDocument.removeEventListener('visibilitychange', update);
	}

	clear(): void {
		for (const item of [...this.#items]) this.dismiss(item.id, 'programmatic');
	}

	dispose(): void {
		for (const id of this.#timers.keys()) this.#deleteTimer(id);
		this.#timers.clear();
		this.#globalPauses.clear();
		this.#items = Object.freeze([]);
		this.#connections = 0;
	}

	#demoteOverflow(): void {
		const exiting = this.#items.filter((item) => item.phase === 'exiting').length;
		const visibleLimit = Math.max(0, this.#maxVisible - exiting);
		let visible = 0;
		const demoted: string[] = [];
		const next = this.#items.map((item) => {
			if (item.phase !== 'visible') return item;
			visible += 1;
			if (visible <= visibleLimit) return item;
			demoted.push(item.id);
			return Object.freeze({ ...item, phase: 'queued' as const });
		});
		if (demoted.length === 0) return;
		this.#items = Object.freeze(next);
		for (const id of demoted) {
			const timer = this.#timers.get(id);
			if (!timer) continue;
			this.#stopTimer(timer);
			// The demoted Toast is unmounted, so element-local hover/focus leave events
			// are not guaranteed to fire. Only document-level pauses may survive queueing.
			timer.paused.delete('focus');
			timer.paused.delete('hover');
		}
	}

	#deleteTimer(id: string): void {
		const timer = this.#timers.get(id);
		if (timer?.handle !== undefined) clearTimeout(timer.handle);
		this.#timers.delete(id);
	}

	#ensureTimer(item: ToastRecord): void {
		if (item.duration === null || this.#timers.has(item.id)) {
			this.#schedule(item.id);
			return;
		}
		this.#startTimer(item);
	}

	#promote(): void {
		let occupied = this.#items.filter((item) => item.phase !== 'queued').length;
		if (occupied >= this.#maxVisible) return;
		const promoted: ToastRecord[] = [];
		const next = this.#items.map((item) => {
			if (item.phase !== 'queued' || occupied >= this.#maxVisible) return item;
			occupied += 1;
			const visible = Object.freeze({ ...item, phase: 'visible' as const });
			promoted.push(visible);
			return visible;
		});
		if (promoted.length === 0) return;
		this.#items = Object.freeze(next);
		for (const item of promoted) this.#ensureTimer(item);
	}

	#remove(id: string): void {
		this.#deleteTimer(id);
		this.#items = Object.freeze(this.#items.filter((item) => item.id !== id));
	}

	#schedule(id: string): void {
		const timer = this.#timers.get(id);
		const item = this.#items.find((candidate) => candidate.id === id);
		if (
			!timer ||
			item?.phase !== 'visible' ||
			this.#connections === 0 ||
			timer.handle !== undefined ||
			timer.paused.size > 0
		)
			return;
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

	#setPhase(id: string, phase: ToastPhase): void {
		this.#items = Object.freeze(
			this.#items.map((item) => (item.id === id ? Object.freeze({ ...item, phase }) : item))
		);
	}

	#startTimer(record: ToastRecord, pauses?: ReadonlySet<ToastPauseReason>): void {
		if (record.duration === null) return;
		this.#timers.set(record.id, {
			paused: new Set(pauses ?? this.#globalPauses),
			remaining: record.duration,
			startedAt: now()
		});
		this.#schedule(record.id);
	}

	#stopTimer(timer: ToastTimer): void {
		if (timer.handle === undefined) return;
		clearTimeout(timer.handle);
		timer.handle = undefined;
		timer.remaining = Math.max(0, timer.remaining - (now() - timer.startedAt));
	}
}

export const createToastQueue = (options?: ToastQueueOptions): ToastQueue =>
	new ToastQueue(options);
