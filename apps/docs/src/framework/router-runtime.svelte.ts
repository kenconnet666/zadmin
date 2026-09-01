import { parseDocsRoute, type DocsRoute } from './router.js';

class DocsRouterState {
	current = $state<DocsRoute>({ kind: 'home' });
}

export const docsRouter = new DocsRouterState();

let stopActiveRouter: (() => void) | undefined;

export function startDocsRouter(view: Window): () => void {
	stopActiveRouter?.();
	let frame: number | undefined;
	let active = true;

	function sync(): void {
		const route = parseDocsRoute(view.location.hash);
		docsRouter.current = route;
		if (frame !== undefined) view.cancelAnimationFrame(frame);
		frame = view.requestAnimationFrame(() => {
			frame = undefined;
			if (!active) return;
			if (route.kind === 'component' && route.section) {
				view.document.getElementById(route.section)?.scrollIntoView({ block: 'start' });
			} else {
				view.scrollTo({ top: 0 });
			}
		});
	}

	function stop(): void {
		if (!active) return;
		active = false;
		view.removeEventListener('hashchange', sync);
		if (frame !== undefined) view.cancelAnimationFrame(frame);
		if (stopActiveRouter === stop) stopActiveRouter = undefined;
	}

	view.addEventListener('hashchange', sync);
	stopActiveRouter = stop;
	sync();
	return stop;
}
