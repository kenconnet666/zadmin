import { getActiveElement } from '../../runtime/layer/dom-realm.js';

/**
 * Preserves select-on-focus for numeric date/time segments on WebKit's initial pointer focus.
 * Subsequent pointer interactions stay native so users can position a caret in an active segment.
 */
export function focusSegmentFromInitialPointer(
	event: PointerEvent & { currentTarget: HTMLInputElement }
): void {
	if (event.button !== 0 || getActiveElement(event.currentTarget) === event.currentTarget) return;
	event.preventDefault();
	event.currentTarget.focus({ preventScroll: true });
}
