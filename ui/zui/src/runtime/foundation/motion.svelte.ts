import type { ZuiMotion } from './context.js';

type ReducedMotionListener = (reduced: boolean) => void;

interface RealmMotionObserver {
	readonly listeners: Set<ReducedMotionListener>;
	readonly query: MediaQueryList;
	readonly update: (event: MediaQueryListEvent | MediaQueryList) => void;
}

const REALM_OBSERVERS = new WeakMap<Window, RealmMotionObserver>();

function observeReducedMotion(view: Window, listener: ReducedMotionListener): () => void {
	let observer = REALM_OBSERVERS.get(view);
	if (!observer) {
		const query = view.matchMedia('(prefers-reduced-motion: reduce)');
		const listeners = new Set<ReducedMotionListener>();
		const update = (event: MediaQueryListEvent | MediaQueryList): void => {
			for (const current of listeners) current(event.matches);
		};
		observer = { listeners, query, update };
		REALM_OBSERVERS.set(view, observer);
		query.addEventListener('change', update);
	}

	observer.listeners.add(listener);
	listener(observer.query.matches);
	let connected = true;
	return () => {
		if (!connected || !observer) return;
		connected = false;
		observer.listeners.delete(listener);
		if (observer.listeners.size > 0) return;
		observer.query.removeEventListener('change', observer.update);
		REALM_OBSERVERS.delete(view);
	};
}

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

	connect(view: Window | null | undefined): () => void {
		if (!view || typeof view.matchMedia !== 'function') return () => {};
		return observeReducedMotion(view, (reduced) => (this.#systemReduced = reduced));
	}
}
