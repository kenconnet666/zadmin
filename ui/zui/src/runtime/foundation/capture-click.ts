import type { Action } from 'svelte/action';

export type CaptureClickHandler = (event: MouseEvent) => void;

/**
 * Runs click interception at the target capture phase, before Svelte's delegated
 * document listener and before native ancestor listeners observe the event.
 */
export const captureClick: Action<HTMLElement, CaptureClickHandler> = (node, initialHandler) => {
	let handler = initialHandler;
	const listener = (event: MouseEvent) => handler(event);

	node.addEventListener('click', listener, true);
	return {
		destroy: () => node.removeEventListener('click', listener, true),
		update: (nextHandler) => (handler = nextHandler)
	};
};
