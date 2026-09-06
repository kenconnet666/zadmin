import type { SelectionKey } from './selection.js';
import {
	calculateOverflowLayout,
	sameOverflowLayout,
	type OverflowLayout,
	type OverflowCollapseFrom
} from './overflow-layout.js';

export interface OverflowMeasureSource<TKey extends SelectionKey> {
	readonly keys: readonly TKey[];
	readonly maxRows: number;
	readonly maxVisibleItems?: number;
	readonly pinnedKeys: readonly TKey[];
	readonly collapseFrom: OverflowCollapseFrom;
	readonly suspended: boolean;
}

function parseCssPixels(value: string): number {
	return Number.parseFloat(value) || 0;
}

function inlineBox(node: HTMLElement): { borderBox: number; contentBox: number } {
	const css = node.ownerDocument.defaultView!.getComputedStyle(node);
	const edges =
		parseCssPixels(css.paddingInlineStart) +
		parseCssPixels(css.paddingInlineEnd) +
		parseCssPixels(css.borderInlineStartWidth) +
		parseCssPixels(css.borderInlineEndWidth);
	const used = Number.parseFloat(css.inlineSize);
	const borderBox = Number.isFinite(used)
		? used + (css.boxSizing === 'border-box' ? 0 : edges)
		: css.writingMode.startsWith('vertical')
			? node.offsetHeight
			: node.offsetWidth;
	return { borderBox: Math.max(0, borderBox), contentBox: Math.max(0, borderBox - edges) };
}

/** One DOM instance per item; hidden wrappers remain measurable and inert, never cloned. */
export class OverflowMeasurement<TKey extends SelectionKey> {
	readonly #read: () => OverflowMeasureSource<TKey>;
	readonly #publish: (layout: OverflowLayout<TKey>) => boolean;
	readonly #items = new Map<TKey, HTMLElement>();
	#overflow: HTMLElement | null = null;
	#root: HTMLElement | null = null;
	#view: Window | null = null;
	#resize: ResizeObserver | null = null;
	#mutation: MutationObserver | null = null;
	#ancestors: HTMLElement[] = [];
	#trackingAncestors = false;
	#frame: number | undefined;
	#releaseFonts: (() => void) | undefined;
	#generation = 0;
	#reset = true;
	#settled = false;
	#overflowBudget = 0;
	#conservative = false;
	#visitedLayouts = new Set<string>();
	#lastLayout: OverflowLayout<TKey> | null = null;
	#signature = '';
	#lastOverflowWidth = -1;
	#originalAvailable = '';
	#originalPriority = '';
	#lastAvailable: string | undefined;

	constructor(
		read: () => OverflowMeasureSource<TKey>,
		publish: (layout: OverflowLayout<TKey>) => boolean
	) {
		this.#read = read;
		this.#publish = publish;
	}
	get itemElements(): ReadonlyMap<TKey, HTMLElement> {
		return this.#items;
	}
	get overflowElement(): HTMLElement | null {
		return this.#overflow;
	}
	registerItem(key: TKey, node: HTMLElement): () => void {
		this.#items.set(key, node);
		this.#resize?.observe(node);
		this.invalidate();
		return () => {
			if (this.#items.get(key) !== node) return;
			this.#items.delete(key);
			this.#resize?.unobserve(node);
			this.invalidate();
		};
	}
	registerOverflow(node: HTMLElement): () => void {
		this.#overflow = node;
		this.#resize?.observe(node);
		this.invalidate();
		return () => {
			if (this.#overflow !== node) return;
			this.#resize?.unobserve(node);
			this.#overflow = null;
		};
	}
	connect(root: HTMLElement | null): () => void {
		this.disconnect();
		this.#root = root;
		const view = root?.ownerDocument.defaultView;
		if (!root || !view) return () => {};
		this.#view = view;
		this.#originalAvailable = root.style.getPropertyValue('--zui-overflow-available');
		this.#originalPriority = root.style.getPropertyPriority('--zui-overflow-available');
		this.#lastAvailable = undefined;
		const generation = this.#generation;
		const Resize = view.ResizeObserver;
		if (Resize) {
			this.#resize = new Resize(() => this.#schedule());
			this.#resize.observe(root);
			for (const item of this.#items.values()) this.#resize.observe(item);
			if (this.#overflow) this.#resize.observe(this.#overflow);
		}
		const Mutation = view.MutationObserver;
		if (Mutation) {
			this.#mutation = new Mutation((records) => {
				for (const record of records) {
					const target = record.target;
					if (this.#overflow?.contains(target)) continue; // its resize closes the current packing cycle
					if (target === root && record.type === 'childList') continue; // item actions own membership; indicator moves are internal
					if (
						record.type === 'attributes' &&
						['data-overflow-hidden', 'aria-hidden', 'inert'].includes(record.attributeName ?? '')
					)
						continue;
					if (
						target === root &&
						record.type === 'attributes' &&
						['data-measured', 'data-fits'].includes(record.attributeName ?? '')
					)
						continue;
					this.invalidate();
					break;
				}
			});
		}
		this.#observeAncestors();
		view.addEventListener('resize', this.#onEnvironmentChange);
		const fonts = root.ownerDocument.fonts;
		if (fonts) {
			fonts.addEventListener('loadingdone', this.#onEnvironmentChange);
			fonts.addEventListener('loadingerror', this.#onEnvironmentChange);
			void fonts.ready.then(() => {
				if (generation === this.#generation) this.invalidate();
			});
			this.#releaseFonts = () => {
				fonts.removeEventListener('loadingdone', this.#onEnvironmentChange);
				fonts.removeEventListener('loadingerror', this.#onEnvironmentChange);
			};
		}
		this.invalidate();
		return () => {
			if (generation === this.#generation) this.disconnect();
		};
	}
	disconnect(): void {
		this.#generation += 1;
		if (
			this.#root &&
			this.#lastAvailable !== undefined &&
			this.#root.style.getPropertyValue('--zui-overflow-available') === this.#lastAvailable
		) {
			if (this.#originalAvailable)
				this.#root.style.setProperty(
					'--zui-overflow-available',
					this.#originalAvailable,
					this.#originalPriority
				);
			else this.#root.style.removeProperty('--zui-overflow-available');
		}
		this.#lastAvailable = undefined;
		if (this.#frame !== undefined) this.#view?.cancelAnimationFrame(this.#frame);
		this.#frame = undefined;
		this.#resize?.disconnect();
		this.#resize = null;
		this.#mutation?.disconnect();
		this.#mutation = null;
		this.#view?.removeEventListener('resize', this.#onEnvironmentChange);
		this.#releaseFonts?.();
		this.#releaseFonts = undefined;
		this.#view = null;
		this.#root = null;
		this.#ancestors = [];
		this.#trackingAncestors = false;
		this.#reset = true;
		this.#settled = false;
		this.#signature = '';
		this.#visitedLayouts.clear();
		this.#lastLayout = null;
		this.#conservative = false;
	}
	invalidate(): void {
		this.#reset = true;
		this.#settled = false;
		this.#schedule();
	}
	readonly #onEnvironmentChange = (): void => this.invalidate();
	#schedule(): void {
		if (!this.#view || this.#frame !== undefined) return;
		const generation = this.#generation;
		this.#frame = this.#view.requestAnimationFrame(() => {
			this.#frame = undefined;
			if (generation === this.#generation) this.#measure();
		});
	}
	#observeAncestors(): void {
		const root = this.#root;
		if (!root) return;
		const ancestors: HTMLElement[] = [];
		let node: HTMLElement | null =
			root.parentElement ??
			((root.getRootNode() as ShadowRoot).host as HTMLElement | undefined) ??
			null;
		while (node) {
			ancestors.push(node);
			node =
				node.parentElement ??
				((node.getRootNode() as ShadowRoot).host as HTMLElement | undefined) ??
				null;
		}
		if (
			this.#trackingAncestors &&
			ancestors.length === this.#ancestors.length &&
			ancestors.every((node, index) => node === this.#ancestors[index])
		)
			return;
		this.#trackingAncestors = true;
		for (const old of this.#ancestors) this.#resize?.unobserve(old);
		this.#ancestors = ancestors;
		this.#mutation?.disconnect();
		this.#mutation?.observe(root, {
			subtree: true,
			childList: true,
			characterData: true,
			attributes: true
		});
		for (const ancestor of ancestors) {
			this.#resize?.observe(ancestor);
			this.#mutation?.observe(ancestor, {
				attributes: true,
				attributeFilter: ['class', 'style', 'dir']
			});
		}
	}
	#measure(): void {
		const root = this.#root;
		const view = this.#view;
		if (!root?.isConnected || !view || !this.#overflow) return;
		const source = this.#read();
		if (source.suspended) return;
		if (root.ownerDocument.defaultView !== view) {
			this.connect(root);
			return;
		}
		this.#observeAncestors();
		const available = inlineBox(root).contentBox;
		if (available <= 0 || root.getClientRects().length === 0) return;
		const availableValue = `${available}px`;
		if (root.style.getPropertyValue('--zui-overflow-available') !== availableValue)
			root.style.setProperty('--zui-overflow-available', availableValue);
		this.#lastAvailable = availableValue;
		const items = source.keys.map((key) => {
			const element = this.#items.get(key);
			if (!element?.isConnected) return null;
			const css = view.getComputedStyle(element);
			return {
				key,
				inlineSize:
					inlineBox(element).borderBox +
					parseCssPixels(css.marginInlineStart) +
					parseCssPixels(css.marginInlineEnd)
			};
		});
		if (items.some((item) => item === null)) return;
		const gap = parseCssPixels(view.getComputedStyle(root).columnGap);
		const overflowWidth = inlineBox(this.#overflow).borderBox;
		const signature = JSON.stringify([
			available,
			gap,
			items.map((item) => [item!.key, item!.inlineSize])
		]);
		const reset =
			this.#reset ||
			signature !== this.#signature ||
			(this.#settled && overflowWidth !== this.#lastOverflowWidth);
		this.#overflowBudget = reset ? overflowWidth : Math.max(this.#overflowBudget, overflowWidth);
		if (reset) {
			this.#visitedLayouts.clear();
			this.#conservative = false;
		}
		this.#reset = false;
		this.#signature = signature;
		this.#lastOverflowWidth = overflowWidth;
		const options = {
			...source,
			items: items.filter((item): item is NonNullable<typeof item> => item !== null),
			availableInlineSize: available,
			gap
		};
		let layout = calculateOverflowLayout({
			...options,
			overflowInlineSize: this.#conservative ? this.#overflowBudget : overflowWidth
		});
		const identity = (value: OverflowLayout<TKey>) =>
			JSON.stringify([value.visibleKeys, value.overflowKeys, value.rows, value.fits]);
		// A count-dependent snippet can have no fixed point. Only after detecting a repeated
		// split do we retain the widest observed indicator; ordinary shrinking can reclaim space.
		if (
			!this.#conservative &&
			this.#visitedLayouts.has(identity(layout)) &&
			!sameOverflowLayout(this.#lastLayout, layout)
		) {
			this.#conservative = true;
			layout = calculateOverflowLayout({ ...options, overflowInlineSize: this.#overflowBudget });
		}
		this.#visitedLayouts.add(identity(layout));
		this.#lastLayout = layout;
		this.#settled = !this.#publish(layout);
		if (!this.#settled) this.#schedule();
	}
}
