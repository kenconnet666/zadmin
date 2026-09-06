import { isDomDocument, isDomHtmlElement } from './layer/dom-realm.js';

export type ScrollContainer = HTMLElement | Window;

export interface ScrollTargetViewport {
	readonly bottom: number;
	readonly left: number;
	readonly right: number;
	readonly top: number;
}

export function isDomWindow(value: unknown): value is Window {
	if (typeof value !== 'object' || value === null) return false;
	const candidate = value as Window;
	return isDomDocument(candidate.document) && candidate.document.defaultView === candidate;
}

export function assertScrollTargetOwner(target: ScrollContainer, ownerDocument: Document): void {
	if (!isDomHtmlElement(target) && !isDomWindow(target))
		throw new TypeError('Scroll container must be a Window or HTMLElement.');
	const document = isDomHtmlElement(target) ? target.ownerDocument : target.document;
	if (document !== ownerDocument)
		throw new TypeError('Scroll target must belong to the component ownerDocument.');
}

export function scrollTargetPosition(target: ScrollContainer): number {
	return scrollTargetElement(target).scrollTop;
}

export function scrollTargetElement(target: ScrollContainer): HTMLElement {
	return isDomHtmlElement(target)
		? target
		: ((target.document.scrollingElement ?? target.document.documentElement) as HTMLElement);
}

export function scrollTargetViewport(target: ScrollContainer): ScrollTargetViewport {
	if (isDomHtmlElement(target)) {
		const rect = target.getBoundingClientRect();
		return {
			bottom: rect.top + target.clientTop + target.clientHeight,
			left: rect.left + target.clientLeft,
			right: rect.left + target.clientLeft + target.clientWidth,
			top: rect.top + target.clientTop
		};
	}
	return {
		bottom: target.innerHeight,
		left: 0,
		right: target.innerWidth,
		top: 0
	};
}

export function scrollTargetToTop(target: ScrollContainer, behavior: ScrollBehavior): void {
	target.scrollTo({
		behavior,
		left: isDomHtmlElement(target) ? target.scrollLeft : target.scrollX,
		top: 0
	});
}
