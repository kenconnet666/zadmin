export type PresenceState = 'entered' | 'exited' | 'exiting';

export function durationMilliseconds(value: number | string): number {
	if (typeof value === 'number') {
		if (!Number.isFinite(value) || value < 0) throw new TypeError('Duration must be non-negative.');
		return value;
	}
	const match = /^(-?(?:\d+\.?\d*|\.\d+))(ms|s)$/u.exec(value.trim());
	if (!match) throw new TypeError('Duration must use ms or s units.');
	const amount = Number(match[1]);
	if (!Number.isFinite(amount) || amount < 0) throw new TypeError('Duration must be non-negative.');
	return match[2] === 's' ? amount * 1000 : amount;
}

export class Presence {
	#mounted = $state(false);
	#state = $state<PresenceState>('exited');
	#timer: ReturnType<typeof setTimeout> | undefined;

	constructor(initiallyPresent = false) {
		this.#mounted = initiallyPresent;
		this.#state = initiallyPresent ? 'entered' : 'exited';
	}

	get mounted(): boolean {
		return this.#mounted;
	}

	get state(): PresenceState {
		return this.#state;
	}

	update(present: boolean, exitDuration = 0): void {
		this.#clearTimer();
		if (present) {
			this.#mounted = true;
			this.#state = 'entered';
			return;
		}
		if (!this.#mounted) return;
		const duration = durationMilliseconds(exitDuration);
		if (duration === 0) {
			this.#exit();
			return;
		}
		this.#state = 'exiting';
		this.#timer = setTimeout(() => this.#exit(), duration);
	}

	destroy(): void {
		this.#clearTimer();
	}

	#clearTimer(): void {
		if (this.#timer !== undefined) clearTimeout(this.#timer);
		this.#timer = undefined;
	}

	#exit(): void {
		this.#timer = undefined;
		this.#mounted = false;
		this.#state = 'exited';
	}
}
