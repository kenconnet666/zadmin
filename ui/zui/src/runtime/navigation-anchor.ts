import { assertSelectionKey, type SelectionKey } from './collection/selection.js';
import { scrollTargetElement, type ScrollContainer } from './scroll-target.js';
export type { ScrollContainer } from './scroll-target.js';
import { containsComposedNode, isDomHtmlElement, isDomShadowRoot } from './layer/dom-realm.js';

export interface AnchorItem<TKey extends SelectionKey = SelectionKey> {
	readonly key: TKey;
	readonly label: string;
	readonly href: string;
	readonly targetId?: string;
	readonly disabled?: boolean;
	readonly children?: readonly AnchorItem<TKey>[];
}

export interface AnchorRecord<TKey extends SelectionKey = SelectionKey> {
	readonly item: AnchorItem<TKey>;
	readonly depth: number;
	readonly disabled: boolean;
}

export interface AnchorNavigateRequest<TKey extends SelectionKey = SelectionKey> {
	readonly item: AnchorItem<TKey>;
	readonly target: HTMLElement;
	readonly originalEvent: MouseEvent;
	readonly defaultPrevented: boolean;
	preventDefault(): void;
}

export function indexAnchorItems<TKey extends SelectionKey>(
	items: readonly AnchorItem<TKey>[]
): readonly AnchorRecord<TKey>[] {
	const records: AnchorRecord<TKey>[] = [];
	const keys = new Set<SelectionKey>();
	const path = new Set<AnchorItem<TKey>>();
	function visit(entries: readonly AnchorItem<TKey>[], depth: number, disabled: boolean): void {
		if (!Array.isArray(entries)) throw new TypeError('Anchor items and children must be arrays.');
		for (const item of entries as readonly AnchorItem<TKey>[]) {
			if (!item || typeof item !== 'object') throw new TypeError('Anchor items must be objects.');
			if (path.has(item)) throw new TypeError('Anchor items cannot contain cycles.');
			assertSelectionKey(item.key, 'Anchor item.key');
			if (keys.has(item.key)) throw new TypeError('Anchor item keys must be globally unique.');
			keys.add(item.key);
			if (typeof item.label !== 'string' || !item.label.trim())
				throw new TypeError('Anchor item.label must not be empty.');
			if (typeof item.href !== 'string' || !item.href.trim())
				throw new TypeError('Anchor item.href must not be empty.');
			if (
				item.targetId !== undefined &&
				(typeof item.targetId !== 'string' || !item.targetId.trim())
			)
				throw new TypeError('Anchor item.targetId must not be empty.');
			const unavailable = disabled || item.disabled === true;
			records.push(Object.freeze({ item, depth, disabled: unavailable }));
			if (item.children) {
				path.add(item);
				visit(item.children, depth + 1, unavailable);
				path.delete(item);
			}
		}
	}
	visit(items, 0, false);
	return Object.freeze(records);
}

export function anchorLocalUrl(href: string, document: Document): URL | null {
	try {
		const target = new URL(href, document.baseURI);
		const current = new URL(document.URL);
		return target.origin === current.origin &&
			target.pathname === current.pathname &&
			target.search === current.search
			? target
			: null;
	} catch {
		return null;
	}
}

export function findAnchorTarget(item: AnchorItem, root: HTMLElement): HTMLElement | null {
	const url = anchorLocalUrl(item.href, root.ownerDocument);
	if (!url) return null;
	let id = item.targetId;
	if (!id) {
		try {
			id = decodeURIComponent(url.hash.slice(1));
		} catch {
			return null;
		}
	}
	if (!id) return null;
	const tree = root.getRootNode();
	const target = (isDomShadowRoot(tree) ? tree : root.ownerDocument).getElementById(id);
	return isDomHtmlElement(target) ? target : null;
}

function cssPixels(value: string, reference = 0): number {
	const pixels = Number.parseFloat(value);
	return Number.isFinite(pixels)
		? value.trim().endsWith('%')
			? (pixels * reference) / 100
			: pixels
		: 0;
}

export function anchorTargetPosition(
	target: HTMLElement,
	container: ScrollContainer,
	offset: number
): number {
	const scroll = scrollTargetElement(container);
	const view = scroll.ownerDocument.defaultView;
	if (!view) return 0;
	const origin = isDomHtmlElement(container)
		? container.getBoundingClientRect().top + container.clientTop
		: 0;
	const padding = cssPixels(view.getComputedStyle(scroll).scrollPaddingTop, scroll.clientHeight);
	const margin = cssPixels(view.getComputedStyle(target).scrollMarginTop);
	return target.getBoundingClientRect().top - origin + scroll.scrollTop - padding - margin - offset;
}

export function anchorContainsTarget(target: HTMLElement, container: ScrollContainer): boolean {
	const scroll = scrollTargetElement(container);
	return (
		target.ownerDocument === scroll.ownerDocument &&
		target.isConnected &&
		(!isDomHtmlElement(container) || containsComposedNode(container, target))
	);
}
