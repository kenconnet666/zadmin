const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';

function objectNodeType(value: unknown): number | undefined {
	return typeof value === 'object' && value !== null
		? (value as { readonly nodeType?: number }).nodeType
		: undefined;
}

export function isDomDocument(value: unknown): value is Document {
	if (objectNodeType(value) !== 9) return false;
	const candidate = value as Document;
	const constructor = candidate.defaultView?.Document;
	return constructor
		? candidate instanceof constructor
		: candidate.ownerDocument === null && candidate.documentElement?.ownerDocument === candidate;
}

export function isDomNode(value: unknown): value is Node {
	const type = objectNodeType(value);
	if (type === undefined) return false;
	if (type === 9) return isDomDocument(value);
	const candidate = value as Node;
	const ownerDocument = candidate.ownerDocument;
	if (!isDomDocument(ownerDocument)) return false;
	const constructor = ownerDocument.defaultView?.Node;
	return constructor ? candidate instanceof constructor : typeof candidate.nodeName === 'string';
}

export function isDomElement(value: unknown): value is Element {
	if (objectNodeType(value) !== 1 || !isDomNode(value)) return false;
	const candidate = value as Element;
	const constructor = candidate.ownerDocument.defaultView?.Element;
	return constructor ? candidate instanceof constructor : typeof candidate.tagName === 'string';
}

export function isDomHtmlElement(value: unknown): value is HTMLElement {
	if (!isDomElement(value) || value.namespaceURI !== HTML_NAMESPACE) return false;
	const constructor = value.ownerDocument.defaultView?.HTMLElement;
	return constructor ? value instanceof constructor : 'style' in value;
}

export function isDomShadowRoot(value: unknown): value is ShadowRoot {
	if (objectNodeType(value) !== 11 || !isDomNode(value)) return false;
	const candidate = value as ShadowRoot;
	const constructor = candidate.ownerDocument.defaultView?.ShadowRoot;
	return constructor
		? candidate instanceof constructor
		: 'host' in candidate && isDomElement(candidate.host);
}

/** Reads focus from the node's actual tree, including a known closed shadow root. */
export function getActiveElement(node: Node): Element | null {
	const tree = node.getRootNode();
	const document = isDomDocument(node) ? node : node.ownerDocument;
	let active =
		(isDomShadowRoot(tree) ? tree.activeElement : null) ?? document?.activeElement ?? null;
	while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
	return active;
}

/** DOM containment across shadow boundaries and assigned slots, without realm assumptions. */
export function containsComposedNode(container: Node | null, target: unknown): boolean {
	if (!container || !isDomNode(target)) return false;
	let node: Node | null = target;
	while (node) {
		if (container.contains(node)) return true;
		if (isDomElement(node) && node.assignedSlot) {
			node = node.assignedSlot;
			continue;
		}
		const tree = node.getRootNode();
		node = isDomShadowRoot(tree) ? tree.host : null;
	}
	return false;
}

/** Keyboard direction follows the rendered element, including native dir=auto and CSS overrides. */
export function getElementDirection(
	element: HTMLElement | null,
	fallback: 'ltr' | 'rtl'
): 'ltr' | 'rtl' {
	const direction = element?.ownerDocument.defaultView?.getComputedStyle(element).direction;
	return direction === 'ltr' || direction === 'rtl' ? direction : fallback;
}
