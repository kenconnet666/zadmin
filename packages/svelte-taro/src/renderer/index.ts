import { document, type TaroElement, type TaroText } from '@tarojs/runtime';
import { createRenderer } from 'svelte/renderer';

type TaroFragment = TaroElement;
type TaroRendererNode = TaroElement | TaroText;
type RendererKind = 'comment' | 'element' | 'fragment' | 'text';

const kinds = new WeakMap<object, RendererKind>();

function mark<TNode extends TaroRendererNode>(node: TNode, kind: RendererKind): TNode {
	kinds.set(node, kind);
	return node;
}

function eventType(type: string): string {
	return type === 'click' ? 'tap' : type;
}

const taroRenderer = createRenderer<{
	fragment: TaroFragment;
	element: TaroElement;
	text: TaroText;
	comment: TaroText;
}>({
	createFragment() {
		return mark(document.createElement('document-fragment') as TaroFragment, 'fragment');
	},
	createElement(name) {
		return mark(document.createElement(name) as TaroElement, 'element');
	},
	createTextNode(data) {
		return mark(document.createTextNode(data), 'text');
	},
	createComment(data) {
		const comment = mark(document.createComment(), 'comment');
		comment.data = data;
		return comment;
	},
	nodeType(node) {
		return kinds.get(node) ?? (node.nodeName === '#text' ? 'text' : 'element');
	},
	getNodeValue(node) {
		return node.nodeValue ?? null;
	},
	getAttribute(element, name) {
		const value = element.getAttribute(name);
		return value === undefined || value === null ? null : String(value);
	},
	setAttribute(element, key, value) {
		element.setAttribute(key, value);
	},
	removeAttribute(element, name) {
		element.removeAttribute(name);
	},
	hasAttribute(element, name) {
		return element.hasAttribute(name);
	},
	setText(node, text) {
		node.textContent = text;
	},
	getFirstChild(node) {
		return node.firstChild as TaroRendererNode | null;
	},
	getLastChild(node) {
		return node.lastChild as TaroRendererNode | null;
	},
	getNextSibling(node) {
		return node.nextSibling as TaroRendererNode | null;
	},
	insert(parent, node, anchor) {
		parent.insertBefore(node, anchor);
	},
	remove(node) {
		node.remove();
	},
	getParent(node) {
		return node.parentNode as TaroRendererNode | null;
	},
	addEventListener(target, type, handler, options) {
		target.addEventListener(eventType(type), handler, options);
	},
	removeEventListener(target, type, handler, options) {
		target.removeEventListener(eventType(type), handler, options);
	}
});

export function createTaroFragment(): TaroFragment {
	return taroRenderer.createFragment();
}

export default taroRenderer;
