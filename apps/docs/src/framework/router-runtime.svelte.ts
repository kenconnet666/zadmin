import { parseDocsRoute, type DocsRoute } from './router.js';

class DocsRouterState {
	current = $state<DocsRoute>({ kind: 'home' });
}

export const docsRouter = new DocsRouterState();

let stopActiveRouter: (() => void) | undefined;

export function startDocsRouter(view: Window): () => void {
	stopActiveRouter?.();
	let active = true;

	function sync(): void {
		if (active) docsRouter.current = parseDocsRoute(view.location.hash);
	}

	function stop(): void {
		if (!active) return;
		active = false;
		view.removeEventListener('hashchange', sync);
		if (stopActiveRouter === stop) stopActiveRouter = undefined;
	}

	view.addEventListener('hashchange', sync);
	stopActiveRouter = stop;
	sync();
	return stop;
}
