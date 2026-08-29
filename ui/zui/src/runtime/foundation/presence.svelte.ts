export type PresenceState = 'entered' | 'exited' | 'exiting';

export interface PresenceSnapshot {
	readonly mounted: boolean;
	readonly state: PresenceState;
}

export interface PresenceController {
	readonly mounted: boolean;
	readonly state: PresenceState;
	destroy(): void;
	finishExit(): void;
	update(present: boolean, exitDuration?: number): void;
}

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
	#mounted = false;
	readonly #onChange?: (snapshot: PresenceSnapshot) => void;
	#present: boolean;
	#state: PresenceState = 'exited';
	#timer: ReturnType<typeof setTimeout> | undefined;

	constructor(initiallyPresent = false, onChange?: (snapshot: PresenceSnapshot) => void) {
		this.#onChange = onChange;
		this.#present = initiallyPresent;
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
		if (present === this.#present) return;
		this.#present = present;
		this.#clearTimer();
		if (present) {
			this.#mounted = true;
			this.#state = 'entered';
			this.#emit();
			return;
		}
		if (!this.#mounted) return;
		const duration = durationMilliseconds(exitDuration);
		if (duration === 0) {
			this.#exit();
			return;
		}
		this.#state = 'exiting';
		this.#emit();
		this.#timer = setTimeout(() => this.#exit(), duration);
	}

	destroy(): void {
		this.#clearTimer();
	}

	finishExit(): void {
		if (this.#present) return;
		this.#clearTimer();
		this.#exit();
	}

	#clearTimer(): void {
		if (this.#timer !== undefined) clearTimeout(this.#timer);
		this.#timer = undefined;
	}

	#exit(): void {
		this.#timer = undefined;
		this.#mounted = false;
		this.#state = 'exited';
		this.#emit();
	}

	#emit(): void {
		this.#onChange?.({ mounted: this.#mounted, state: this.#state });
	}
}

export function createPresence(initiallyPresent = false): PresenceController {
	let mounted = $state(initiallyPresent);
	let state = $state<PresenceState>(initiallyPresent ? 'entered' : 'exited');
	let present = initiallyPresent;
	let timer: ReturnType<typeof setTimeout> | undefined;
	const clearTimer = () => {
		if (timer !== undefined) clearTimeout(timer);
		timer = undefined;
	};
	const exit = () => {
		timer = undefined;
		mounted = false;
		state = 'exited';
	};
	return {
		destroy: clearTimer,
		finishExit() {
			if (present) return;
			clearTimer();
			exit();
		},
		get mounted() {
			return mounted;
		},
		get state() {
			return state;
		},
		update(next, exitDuration = 0) {
			if (next === present) return;
			present = next;
			clearTimer();
			if (next) {
				mounted = true;
				state = 'entered';
				return;
			}
			if (!mounted) return;
			const duration = durationMilliseconds(exitDuration);
			if (duration === 0) exit();
			else {
				state = 'exiting';
				timer = setTimeout(exit, duration);
			}
		}
	};
}
