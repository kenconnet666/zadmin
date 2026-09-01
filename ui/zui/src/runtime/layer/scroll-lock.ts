import { isDomDocument, isDomHtmlElement } from './dom-realm.js';

interface ScrollLockRecord {
	count: number;
	overflow: string;
	paddingInlineEnd: string;
}

const locks = new WeakMap<HTMLElement, ScrollLockRecord>();

export function lockScroll(target: Document | HTMLElement): () => void {
	const element = isDomDocument(target) ? target.body : target;
	if (!isDomHtmlElement(element)) {
		throw new TypeError('Scroll lock target must be a Document or HTMLElement.');
	}
	const existing = locks.get(element);
	if (existing) {
		existing.count += 1;
		return release(element);
	}

	const ownerDocument = element.ownerDocument;
	const ownerWindow = ownerDocument.defaultView;
	const scrollbarWidth =
		element === ownerDocument.body && ownerWindow
			? Math.max(0, ownerWindow.innerWidth - ownerDocument.documentElement.clientWidth)
			: Math.max(0, element.offsetWidth - element.clientWidth);
	const record: ScrollLockRecord = {
		count: 1,
		overflow: element.style.overflow,
		paddingInlineEnd: element.style.paddingInlineEnd
	};
	locks.set(element, record);
	element.style.overflow = 'hidden';
	if (scrollbarWidth > 0) {
		const current =
			Number.parseFloat(
				ownerWindow?.getComputedStyle(element).paddingInlineEnd ?? element.style.paddingInlineEnd
			) || 0;
		element.style.paddingInlineEnd = `${current + scrollbarWidth}px`;
	}
	return release(element);
}

function release(element: HTMLElement): () => void {
	let active = true;
	return () => {
		if (!active) return;
		active = false;
		const record = locks.get(element);
		if (!record) return;
		record.count -= 1;
		if (record.count > 0) return;
		element.style.overflow = record.overflow;
		element.style.paddingInlineEnd = record.paddingInlineEnd;
		locks.delete(element);
	};
}
