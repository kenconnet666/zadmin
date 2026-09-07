import { navigationIntent, type NavigationIntent } from './collection/list-navigation.js';

const SEGMENT_SELECTOR =
	'input:not([type="hidden"]):not([disabled]), button[data-slot="day-period"]:not([disabled])';

export function segmentedNavigationIntent(
	event: Pick<KeyboardEvent, 'key'>,
	direction: 'ltr' | 'rtl'
): NavigationIntent | null {
	return navigationIntent(event.key, 'horizontal', direction) ?? null;
}

export function moveWithinSegmentedBoundary(
	root: HTMLElement,
	target: EventTarget | null,
	intent: NavigationIntent
): boolean {
	const ownerWindow = root.ownerDocument.defaultView;
	if (!ownerWindow || !(target instanceof ownerWindow.HTMLElement)) return false;
	const segments = [...root.querySelectorAll<HTMLElement>(SEGMENT_SELECTOR)].filter(
		(segment) => segment.tabIndex >= 0
	);
	const index = segments.indexOf(target);
	if (index < 0 || segments.length === 0) return false;
	const nextIndex =
		intent === 'first'
			? 0
			: intent === 'last'
				? segments.length - 1
				: intent === 'next'
					? Math.min(index + 1, segments.length - 1)
					: Math.max(index - 1, 0);
	const next = segments[nextIndex];
	if (!next) return false;
	next.focus({ preventScroll: true });
	if (next instanceof ownerWindow.HTMLInputElement) next.select();
	return true;
}
