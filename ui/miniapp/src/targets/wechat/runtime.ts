import { createRenderer } from 'svelte/renderer';
import type { Component } from 'svelte';
import { mount, unmount } from 'svelte';

import { mergeMiniStyles } from '../../styles/index.ts';
import { createWechatPlatformDriver } from '../../platform/driver.ts';
import { createWeChatPlatform } from '../../platform/service.ts';
import { MINIAPP_RUNTIME_CONTEXT, type MiniappRuntimeContext } from '../../runtime/context.ts';
import { ResourceScope } from '../../runtime/scope.ts';
import { assertWeChatElement, type WeChatSnapshot } from './elements.ts';
import { toWeChatEventType, type WeChatRuntimeEvent } from './events.ts';

type Handler = (event: unknown) => void;
type NodeKind = 'comment' | 'element' | 'fragment' | 'text';

let nodeSequence = 0;

abstract class MiniNode {
	readonly childNodes: MiniNode[] = [];
	parentNode: MiniNode | null = null;
	abstract readonly kind: NodeKind;
	abstract readonly nodeName: string;
	nodeValue: string | null = null;

	get firstChild(): MiniNode | null {
		return this.childNodes[0] ?? null;
	}

	get lastChild(): MiniNode | null {
		return this.childNodes.at(-1) ?? null;
	}

	get nextSibling(): MiniNode | null {
		if (this.parentNode === null) return null;
		const index = this.parentNode.childNodes.indexOf(this);
		return this.parentNode.childNodes[index + 1] ?? null;
	}

	get textContent(): string {
		return this.nodeValue ?? this.childNodes.map((child) => child.textContent).join('');
	}

	set textContent(value: string) {
		for (const child of this.childNodes) child.parentNode = null;
		this.childNodes.length = 0;
		if (value.length > 0) this.insertBefore(new MiniText(value), null);
		this.changed();
	}

	insertBefore(node: MiniNode, anchor: MiniNode | null): void {
		node.remove();
		const index = anchor === null ? this.childNodes.length : this.childNodes.indexOf(anchor);
		if (index < 0) throw new TypeError('Miniapp renderer anchor is not a child of the parent.');
		this.childNodes.splice(index, 0, node);
		node.parentNode = this;
		this.changed();
	}

	remove(): void {
		if (this.parentNode === null) return;
		const index = this.parentNode.childNodes.indexOf(this);
		if (index >= 0) this.parentNode.childNodes.splice(index, 1);
		const parent = this.parentNode;
		this.parentNode = null;
		parent.changed();
	}

	changed(): void {
		const root = this.rootNode();
		if (root instanceof MiniFragment) root.schedule();
	}

	rootNode(): MiniNode {
		return this.parentNode?.rootNode() ?? this;
	}

	abstract snapshot(): WeChatSnapshot | undefined;
}

class MiniText extends MiniNode {
	readonly kind: 'comment' | 'text';
	readonly nodeName = '#text';

	constructor(value: string, kind: 'comment' | 'text' = 'text') {
		super();
		this.kind = kind;
		this.nodeValue = value;
	}

	override snapshot(): WeChatSnapshot | undefined {
		return this.kind === 'comment' ? undefined : { kind: 'text', value: this.nodeValue ?? '' };
	}
}

class MiniElement extends MiniNode {
	readonly attributes = new Map<string, unknown>();
	readonly handlers = new Map<string, Set<Handler>>();
	readonly id = `n${(++nodeSequence).toString(36)}`;
	readonly kind = 'element' as const;
	readonly nodeName: string;

	constructor(name: string) {
		super();
		assertWeChatElement(name);
		this.nodeName = name;
	}

	addEventListener(type: string, handler: Handler): void {
		const event = toWeChatEventType(type);
		let handlers = this.handlers.get(event);
		if (handlers === undefined) {
			handlers = new Set();
			this.handlers.set(event, handlers);
		}
		handlers.add(handler);
	}

	removeEventListener(type: string, handler: Handler): void {
		this.handlers.get(toWeChatEventType(type))?.delete(handler);
	}

	dispatch(type: string, event: unknown): void {
		for (const handler of this.handlers.get(type) ?? []) handler.call(this, event);
	}

	override snapshot(): WeChatSnapshot {
		const attributes = Object.fromEntries(
			[...this.attributes].map(([name, value]) => {
				if (name === 'class' && Array.isArray(value))
					return [name, value.flat(Infinity).filter(Boolean).join(' ')];
				if (name === 'style' && typeof value === 'object' && value !== null) {
					return [name, mergeMiniStyles(value as Readonly<Record<string, string | number>>)];
				}
				return [name, value];
			})
		);
		return {
			attributes,
			children: this.childNodes.flatMap((child) => child.snapshot() ?? []),
			id: this.id,
			kind: 'element',
			name: this.nodeName
		};
	}
}

export class MiniFragment extends MiniNode {
	readonly kind = 'fragment' as const;
	readonly nodeName = '#fragment';
	#commit?: (snapshot: WeChatSnapshot) => void;
	#scheduled = false;

	connect(commit: (snapshot: WeChatSnapshot) => void): void {
		this.#commit = commit;
		this.schedule();
	}

	disconnect(): void {
		this.#commit = undefined;
	}

	schedule(): void {
		if (this.#scheduled || this.#commit === undefined) return;
		this.#scheduled = true;
		queueMicrotask(() => {
			this.#scheduled = false;
			this.#commit?.(this.snapshot());
		});
	}

	dispatch(id: string, type: string, event: unknown): void {
		const visit = (node: MiniNode): MiniElement | undefined => {
			if (node instanceof MiniElement && node.id === id) return node;
			for (const child of node.childNodes) {
				const found = visit(child);
				if (found !== undefined) return found;
			}
			return undefined;
		};
		visit(this)?.dispatch(type, event);
	}

	override snapshot(): WeChatSnapshot {
		return {
			children: this.childNodes.flatMap((child) => child.snapshot() ?? []),
			kind: 'fragment'
		};
	}
}

export const wechatRenderer = createRenderer<{
	comment: MiniText;
	element: MiniElement;
	fragment: MiniFragment;
	text: MiniText;
}>({
	addEventListener: (target, type, handler) => target.addEventListener(type, handler),
	createComment: (data) => new MiniText(data, 'comment'),
	createElement: (name) => new MiniElement(name),
	createFragment: () => new MiniFragment(),
	createTextNode: (data) => new MiniText(data),
	getAttribute: (element, name) =>
		element.attributes.has(name) ? String(element.attributes.get(name)) : null,
	getFirstChild: (node) => node.firstChild as MiniElement | MiniFragment | MiniText | null,
	getLastChild: (node) => node.lastChild as MiniElement | MiniFragment | MiniText | null,
	getNextSibling: (node) =>
		((node as MiniNode | null)?.nextSibling ?? null) as
			MiniElement | MiniFragment | MiniText | null,
	getNodeValue: (node) => node.nodeValue,
	getParent: (node) =>
		((node as MiniNode | null)?.parentNode ?? null) as MiniElement | MiniFragment | MiniText | null,
	hasAttribute: (element, name) => element.attributes.has(name),
	insert: (parent, node, anchor) => {
		if (node instanceof MiniFragment && node !== parent) {
			for (const child of [...node.childNodes]) parent.insertBefore(child, anchor);
			return;
		}
		parent.insertBefore(node, anchor);
	},
	nodeType: (node) => node.kind,
	remove: (node) => node.remove(),
	removeAttribute: (element, name) => {
		element.attributes.delete(name);
		element.changed();
	},
	removeEventListener: (target, type, handler) => target.removeEventListener(type, handler),
	setAttribute: (element, name, value) => {
		element.attributes.set(name, value);
		element.changed();
	},
	setText: (node, value) => {
		node.nodeValue = value;
		node.changed();
	}
});

export default wechatRenderer;

export interface WeChatPageInstance {
	setData(data: { readonly root: WeChatSnapshot }): void;
}

export interface WeChatPageEvent extends WeChatRuntimeEvent {
	readonly currentTarget: { readonly dataset: { readonly zid?: string } };
}

type Mounted = Record<string, unknown>;
type PageState = {
	readonly component: Mounted;
	readonly scope: ResourceScope;
	readonly target: MiniFragment;
};
const pageStates = new WeakMap<object, PageState>();

function runtimeContext(scope: ResourceScope, pageId?: string): Map<unknown, unknown> {
	const platform = createWeChatPlatform({ driver: createWechatPlatformDriver(), scope });
	const context: MiniappRuntimeContext = { appScope: scope, pageId, platform, scope };
	return new Map([[MINIAPP_RUNTIME_CONTEXT, context]]);
}

export function createWechatPage(
	component: Component<Record<string, unknown>>
): Record<string, unknown> {
	const dispatch = function (this: object, event: WeChatPageEvent): void {
		const state = pageStates.get(this);
		const id = event.currentTarget.dataset.zid;
		if (state !== undefined && id !== undefined) state.target.dispatch(id, event.type, event);
	};
	return {
		data: { root: { children: [], kind: 'fragment' } },
		onLoad(this: WeChatPageInstance & object, query: Record<string, string> = {}) {
			const target = new MiniFragment();
			const scope = new ResourceScope();
			target.connect((root) => this.setData({ root }));
			const mounted = mount(
				component as unknown as Component<Record<string, unknown>, Record<string, unknown>>,
				{
					context: runtimeContext(scope),
					props: { query },
					renderer: wechatRenderer,
					target
				} as never
			);
			pageStates.set(this, { component: mounted as Mounted, scope, target });
		},
		async onUnload(this: object) {
			const state = pageStates.get(this);
			if (state === undefined) return;
			pageStates.delete(this);
			state.target.disconnect();
			await unmount(state.component);
			await state.scope.dispose();
		},
		__zadmin_confirm: dispatch,
		__zadmin_error: dispatch,
		__zadmin_input: dispatch,
		__zadmin_load: dispatch,
		__zadmin_tap: dispatch
	};
}

export function createWechatApp(
	component: Component<Record<string, unknown>>
): Record<string, unknown> {
	let mounted: Mounted | undefined;
	let scope: ResourceScope | undefined;
	let target: MiniFragment | undefined;
	return {
		onLaunch(options: Record<string, unknown> = {}) {
			target = new MiniFragment();
			scope = new ResourceScope();
			mounted = mount(
				component as unknown as Component<Record<string, unknown>, Record<string, unknown>>,
				{
					context: runtimeContext(scope),
					props: { options },
					renderer: wechatRenderer,
					target
				} as never
			) as Mounted;
		},
		async onHide() {
			await Promise.resolve();
		},
		async onUnload() {
			if (mounted !== undefined) await unmount(mounted);
			await scope?.dispose();
			target?.disconnect();
			mounted = undefined;
			scope = undefined;
			target = undefined;
		}
	};
}
