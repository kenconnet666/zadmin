import { describe, expect, it, vi } from 'vitest';
import { docsRouter, startDocsRouter } from './router-runtime.svelte.js';

describe('Docs router state ownership', () => {
	it('owns one hash listener without doing pre-render scroll/layout work', () => {
		const target = new EventTarget();
		const location = { hash: '#/components/button/api-states' };
		const requestAnimationFrame = vi.fn();
		const scrollTo = vi.fn();
		const view = {
			location,
			requestAnimationFrame,
			scrollTo,
			addEventListener: target.addEventListener.bind(target),
			removeEventListener: target.removeEventListener.bind(target)
		} as unknown as Window;
		const firstStop = startDocsRouter(view);
		expect(docsRouter.current).toMatchObject({
			kind: 'component',
			componentId: 'button',
			section: 'api-states'
		});
		const stop = startDocsRouter(view);
		firstStop();
		location.hash = '#/guides/theme';
		target.dispatchEvent(new Event('hashchange'));
		expect(docsRouter.current).toEqual({ kind: 'guide', guideId: 'theme' });
		expect(requestAnimationFrame).not.toHaveBeenCalled();
		expect(scrollTo).not.toHaveBeenCalled();
		stop();
		location.hash = '#/';
		target.dispatchEvent(new Event('hashchange'));
		expect(docsRouter.current).toEqual({ kind: 'guide', guideId: 'theme' });
	});
});
