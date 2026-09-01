import { isDomDocument, isDomElement, isDomShadowRoot } from './dom-realm.js';

export type PortalTarget = Document | Element | ShadowRoot | null | undefined;

export interface PortalOptions {
	readonly target: PortalTarget;
}

/** Resolve the nearest DOM realm without consulting ambient global document state. */
export function resolvePortalTarget(
	anchor: Node | null | undefined,
	configured?: PortalTarget
): PortalTarget {
	if (configured !== null && configured !== undefined) return configured;
	const root = anchor?.getRootNode();
	if (isDomDocument(root) || isDomShadowRoot(root)) return root;
	return anchor?.ownerDocument ?? null;
}

function resolveTarget(target: PortalTarget): Element | ShadowRoot | null {
	if (target === null || target === undefined) return null;
	if (isDomDocument(target)) return target.body;
	if (isDomElement(target) || isDomShadowRoot(target)) return target;
	throw new TypeError('Portal target must be a Document, Element, ShadowRoot or null.');
}

export function portal(node: HTMLElement, options: PortalOptions) {
	const ownerDocument = node.ownerDocument;
	const placeholder = ownerDocument.createComment('zui-portal');
	const originalParent = node.parentNode;
	originalParent?.insertBefore(placeholder, node);

	const move = (target: PortalTarget) => {
		const destination = resolveTarget(target);
		if (destination && node.parentNode !== destination) destination.append(node);
		else if (!destination && placeholder.parentNode && node.parentNode !== placeholder.parentNode) {
			placeholder.parentNode.insertBefore(node, placeholder.nextSibling);
		}
	};

	move(options.target);
	return {
		destroy() {
			node.remove();
			placeholder.remove();
		},
		update(next: PortalOptions) {
			move(next.target);
		}
	};
}
