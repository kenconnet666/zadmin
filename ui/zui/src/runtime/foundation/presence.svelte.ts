export type PresenceState = 'entered' | 'exited' | 'exiting';
import { durationMilliseconds } from '../../theme/units.js';
export { durationMilliseconds } from '../../theme/units.js';

export interface PresenceSnapshot {
	readonly mounted: boolean;
	readonly state: PresenceState;
}

export interface PresenceController {
	readonly mounted: boolean;
	readonly state: PresenceState;
	destroy(): void;
	finishExit(): void;
	update(present: boolean, exitDuration?: number, ownerWindow?: Window | null): void;
}

function scheduleTimeout(callback: () => void, duration: number, ownerWindow?: Window | null) {
	if (ownerWindow) {
		const timer = ownerWindow.setTimeout(callback, duration);
		return () => ownerWindow.clearTimeout(timer);
	}
	const timer = setTimeout(callback, duration);
	return () => clearTimeout(timer);
}

export class Presence {
	#mounted = false;
	readonly #onChange?: (snapshot: PresenceSnapshot) => void;
	#present: boolean;
	#state: PresenceState = 'exited';
	#cancelTimer: (() => void) | undefined;

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

	update(present: boolean, exitDuration = 0, ownerWindow?: Window | null): void {
		if (present === this.#present) {
			if (!present && this.#state === 'exiting' && durationMilliseconds(exitDuration) === 0) {
				this.#clearTimer();
				this.#exit();
			}
			return;
		}
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
		this.#cancelTimer = scheduleTimeout(() => this.#exit(), duration, ownerWindow);
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
		this.#cancelTimer?.();
		this.#cancelTimer = undefined;
	}

	#exit(): void {
		this.#cancelTimer = undefined;
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
	let cancelTimer: (() => void) | undefined;
	const clearTimer = () => {
		cancelTimer?.();
		cancelTimer = undefined;
	};
	const exit = () => {
		cancelTimer = undefined;
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
		update(next, exitDuration = 0, ownerWindow) {
			if (next === present) {
				if (!next && state === 'exiting' && durationMilliseconds(exitDuration) === 0) {
					clearTimer();
					exit();
				}
				return;
			}
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
				cancelTimer = scheduleTimeout(exit, duration, ownerWindow);
			}
		}
	};
}
