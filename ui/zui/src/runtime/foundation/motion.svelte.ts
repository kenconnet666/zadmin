import type { ZuiMotion } from './context.js';

export class ReducedMotionState {
	readonly #preference: () => ZuiMotion;
	#systemReduced = $state(false);

	constructor(preference: () => ZuiMotion) {
		this.#preference = preference;
	}

	get current(): boolean {
		const preference = this.#preference();
		return preference === 'reduced' || (preference === 'auto' && this.#systemReduced);
	}

	connect(): () => void {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = (event: MediaQueryListEvent | MediaQueryList): void => {
			this.#systemReduced = event.matches;
		};
		update(query);
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	}
}
