<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import type {
		KeyedVirtualItem,
		KeyedVirtualRange,
		VirtualAlign
	} from '../../runtime/collection/virtualizer.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type VirtualListRole = 'grid' | 'list' | 'listbox' | 'tree';
	export type VirtualListItemRole = 'listitem' | 'option' | 'presentation' | 'row' | 'treeitem';
	export type VirtualListScrollBehavior = 'auto' | 'smooth';

	export type VirtualListItemContext<TKey extends SelectionKey = SelectionKey> =
		KeyedVirtualItem<TKey>;

	export interface ZVirtualListController<TKey extends SelectionKey = SelectionKey> {
		readonly range: KeyedVirtualRange<TKey>;

		ensureKey(key: TKey, align?: VirtualAlign): boolean;

		isRendered(key: TKey): boolean;

		measure(): void;

		scrollToIndex(index: number, align?: VirtualAlign, behavior?: VirtualListScrollBehavior): void;

		scrollToKey(key: TKey, align?: VirtualAlign, behavior?: VirtualListScrollBehavior): boolean;
	}

	export interface ZVirtualListProps<
		TItem = unknown,
		TKey extends SelectionKey = SelectionKey
	> extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
		/** @deprecated Use the native `aria-label` attribute. */
		readonly ariaLabel?: string;
		controller?: ZVirtualListController<TKey> | null;
		readonly empty?: Snippet;
		readonly estimateSize?: number | ((item: TItem, index: number) => number);
		readonly height?: number;
		readonly initialIndex?: number;
		readonly initialKey?: TKey;
		readonly item: Snippet<[TItem, number, VirtualListItemContext<TKey>]>;
		readonly itemDisabled?: (item: TItem, index: number) => boolean;
		readonly itemExpanded?: (item: TItem, index: number) => boolean | undefined;
		readonly itemId?: (item: TItem, index: number) => string | undefined;
		readonly itemKey: (item: TItem, index: number) => TKey;
		readonly itemLevel?: (item: TItem, index: number) => number;
		readonly itemPosInSet?: (item: TItem, index: number) => number;
		readonly itemRole?: VirtualListItemRole;
		readonly itemSelected?: (item: TItem, index: number) => boolean | undefined;
		readonly itemSetSize?: (item: TItem, index: number) => number;
		readonly itemSize?: number;
		readonly items: readonly TItem[];
		readonly loading?: boolean;
		readonly loadingContent?: Snippet;
		readonly onItemMount?: (key: TKey, element: HTMLElement) => void | (() => void);
		readonly onRangeChange?: (range: KeyedVirtualRange<TKey>) => void;
		readonly overscan?: number;
		ref?: HTMLDivElement | null;
		readonly role?: VirtualListRole;
		readonly ssrViewportSize?: number;
	}

	export const zuiMetadata = {
		category: 'data-display',
		id: 'virtual-list',
		importStatement: "import { ZVirtualList } from '@zadmin/zui';",
		name: 'ZVirtualList',
		bindings: [
			{ description: '真实滚动viewport引用。', name: 'ref', type: 'HTMLDivElement | null' },
			{
				description: '按key/索引定位、测量失效和虚拟挂载握手的窄imperative controller。',
				name: 'controller',
				type: 'ZVirtualListController<TKey> | null'
			}
		],
		dependencies: [
			'KeyedVirtualizer',
			'ownerDocument ResizeObserver',
			'stable typed item keys',
			'reduced motion'
		],
		events: [
			{
				description: '可见、overscan或测量区间变化。',
				name: 'onRangeChange',
				type: '(range: KeyedVirtualRange<TKey>) => void'
			}
		],
		keyboard: [],
		parts: [
			{ description: '总高度spacer。', name: 'spacer' },
			{ description: '绝对定位且可测量的当前窗口项。', name: 'item' },
			{ description: '空集合内容。', name: 'empty' },
			{ description: '首次加载内容。', name: 'loading' }
		],
		props: [
			{
				default: '—',
				description: '兼容旧版的可访问名称alias；新代码使用原生aria-label。',
				name: 'ariaLabel',
				type: 'string'
			},
			{
				default: '必填',
				description: '数据项；排序、插入和删除均由itemKey维持测量身份。',
				name: 'items',
				required: true,
				type: 'readonly TItem[]'
			},
			{
				default: '必填',
				description: '稳定业务key；string和number保持不同身份，拒绝重复、NaN、Infinity与-0。',
				name: 'itemKey',
				required: true,
				type: '(item: TItem, index: number) => TKey'
			},
			{
				default: '40',
				description: '固定项高fast path；与estimateSize互斥。',
				name: 'itemSize',
				type: 'number'
			},
			{
				default: '—',
				description: '启用动态测量的初始尺寸或逐项估算函数；真实高度按key缓存。',
				name: 'estimateSize',
				type: 'number | ((item: TItem, index: number) => number)'
			},
			{ default: '320', description: 'viewport高度px。', name: 'height', type: 'number' },
			{
				default: 'height',
				description: 'SSR首帧窗口估算高度。',
				name: 'ssrViewportSize',
				type: 'number'
			},
			{ default: '4', description: '可见区上下额外渲染项数。', name: 'overscan', type: 'number' },
			{
				default: '—',
				description: '首次客户端挂载后按索引对齐到start；与initialKey互斥。',
				name: 'initialIndex',
				type: 'number'
			},
			{
				default: '—',
				description: '首次客户端挂载后按稳定key对齐到start；优先用于可变数据。',
				name: 'initialKey',
				type: 'TKey'
			},
			{ default: "'list'", description: '根集合语义。', name: 'role', type: 'VirtualListRole' },
			{
				default: '由role推导',
				description: '测量wrapper语义；复合集合可设presentation并在item snippet中拥有焦点节点。',
				name: 'itemRole',
				type: 'VirtualListItemRole'
			},
			{
				default: 'false',
				description: '把业务禁用状态投射为data-disabled和aria-disabled，但不拥有导航策略。',
				name: 'itemDisabled',
				type: '(item: TItem, index: number) => boolean'
			},
			{
				default: '—',
				description: '为当前挂载wrapper生成DOM id；与ActiveDescendant的opaque idFor配合。',
				name: 'itemId',
				type: '(item: TItem, index: number) => string | undefined'
			},
			{
				default: '—',
				description:
					'把外部SelectionModel结果投射到option/treeitem的aria-selected，不在virtualizer内持有选择。',
				name: 'itemSelected',
				type: '(item: TItem, index: number) => boolean | undefined'
			},
			{
				default: '—',
				description: '为virtual tree wrapper投射aria-expanded。',
				name: 'itemExpanded',
				type: '(item: TItem, index: number) => boolean | undefined'
			},
			{
				default: '—',
				description: '为virtual tree wrapper投射层级aria-level。',
				name: 'itemLevel',
				type: '(item: TItem, index: number) => number'
			},
			{
				default: '—',
				description: '为virtual tree wrapper投射同级位置aria-posinset。',
				name: 'itemPosInSet',
				type: '(item: TItem, index: number) => number'
			},
			{
				default: '—',
				description: '为virtual tree wrapper投射同级aria-setsize。',
				name: 'itemSetSize',
				type: '(item: TItem, index: number) => number'
			},
			{
				default: '—',
				description:
					'真实wrapper挂载回调，可返回cleanup；用于MountedElements/ActiveDescendant握手。',
				name: 'onItemMount',
				type: '(key: TKey, element: HTMLElement) => void | (() => void)'
			},
			{
				default: 'false',
				description: '保留已有项并向viewport投射aria-busy。',
				name: 'loading',
				type: 'boolean'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '可见项正文，同时获得key、测量状态与布局信息。',
				name: 'item',
				type: 'Snippet<[TItem, number, VirtualListItemContext<TKey>]>'
			},
			{ description: '空集合内容。', name: 'empty', type: 'Snippet' },
			{ description: '无已有项时的加载内容。', name: 'loadingContent', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/data-display/ZVirtualList.svelte',
		states: [
			{ description: '首个overscan渲染索引。', name: 'data-range-start', values: ['number'] },
			{ description: '排他overscan结束索引。', name: 'data-range-end', values: ['number'] },
			{ description: '首个真实可见索引。', name: 'data-visible-start', values: ['number'] },
			{ description: '排他真实可见结束索引。', name: 'data-visible-end', values: ['number'] },
			{ description: '动态高度测量模式。', name: 'data-dynamic', values: ['true'] },
			{
				description: '解析后的测量wrapper角色。',
				name: 'data-item-role',
				values: ['listitem', 'option', 'presentation', 'row', 'treeitem']
			},
			{ description: 'Provider或系统减少动画。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'experimental',
		summary:
			'按typed key保存动态测量与滚动锚点，提供SSR稳定窗口、跨realm观察和ActiveDescendant握手的Virtual List。'
	} as const satisfies ZuiComponentMetadata;

	const viewportRecipe = defineRecipe({
		base: (s) => {
			s.height.raw('var(--zui-virtual-list-height)');
			s.overflow.auto;
			s.overflowAnchor.none;
			s.position.relative;
		},
		variants: {},
		defaultVariants: {}
	});
	const spacerRecipe = defineRecipe({
		base: (s) => {
			s.height.raw('var(--zui-virtual-list-total-size)');
			s.position.relative;
			s.width.percent(100);
		},
		variants: {},
		defaultVariants: {}
	});
	const itemRecipe = defineRecipe({
		base: (s) => {
			s.insetBlockStart.px(0);
			s.insetInlineStart.px(0);
			s.position.absolute;
			s.width.percent(100);
			s.overflowAnchor.none;
		},
		variants: {},
		defaultVariants: {}
	});
	const stateRecipe = defineRecipe({
		base: (s) => {
			s.paddingBlock._large;
			s.paddingInline._large;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, viewportRecipe);
	registerRecipeHmr(import.meta, spacerRecipe);
	registerRecipeHmr(import.meta, itemRecipe);
	registerRecipeHmr(import.meta, stateRecipe);
</script>

<script lang="ts" generics="TItem, TKey extends SelectionKey">
	import { onMount, untrack } from 'svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import {
		KeyedVirtualizer,
		type VirtualMeasurement,
		type VirtualSizeEstimate
	} from '../../runtime/collection/virtualizer.js';

	let {
		'aria-busy': ariaBusy,
		'aria-label': ariaLabelAttribute,
		'aria-labelledby': ariaLabelledBy,
		ariaLabel,
		class: className,
		controller = $bindable(null),
		empty,
		estimateSize,
		height = 320,
		initialIndex,
		initialKey,
		item,
		itemDisabled,
		itemExpanded,
		itemId,
		itemKey,
		itemLevel,
		itemPosInSet,
		itemRole,
		itemSelected,
		itemSetSize,
		itemSize,
		items,
		loading = false,
		loadingContent,
		onItemMount,
		onRangeChange,
		onscroll,
		overscan = 4,
		ref = $bindable(null),
		role = 'list',
		ssrViewportSize,
		style,
		tabindex,
		...rest
	}: ZVirtualListProps<TItem, TKey> = $props();

	const zui = useZui();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	let mounted = false;
	let resizeObserver: ResizeObserver | undefined;
	let viewportWidth = -1;
	// DOM registry is mutated by attachments and read by imperative lifecycle code.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const itemElements = new Map<HTMLElement, TKey>();
	const normalized = $derived.by(() => {
		// Normalization-local sets are not rendered state.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const keys = new Set<TKey>();
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const ids = new Set<string>();
		return items.map((entry, index) => {
			const key = itemKey(entry, index);
			if (typeof key === 'number' && (!Number.isFinite(key) || Object.is(key, -0))) {
				throw new TypeError('ZVirtualList keys must be strings or finite numbers other than -0.');
			}
			if (keys.has(key)) {
				const formatted =
					typeof key === 'number' ? `number:${key}` : `string:${JSON.stringify(key)}`;
				throw new Error(`Duplicate ZVirtualList key ${formatted}.`);
			}
			keys.add(key);
			const id = itemId?.(entry, index);
			if (id !== undefined && (!id || /\s/u.test(id) || ids.has(id))) {
				throw new Error(
					`ZVirtualList itemId must return unique non-empty ids without whitespace; received "${id}".`
				);
			}
			if (id) ids.add(id);
			return {
				entry,
				id,
				index,
				key
			};
		});
	});
	const dynamic = $derived(estimateSize !== undefined);
	const reduced = $derived(reducedMotion.current);
	const resolvedAriaLabel = $derived.by(() => {
		const label = ariaLabelAttribute ?? ariaLabel;
		if (role !== 'list' && !label && !ariaLabelledBy) {
			throw new Error(`ZVirtualList role="${role}" requires aria-label or aria-labelledby.`);
		}
		return label;
	});
	const resolvedItemRole = $derived.by(() => {
		const expected =
			role === 'listbox'
				? 'option'
				: role === 'tree'
					? 'treeitem'
					: role === 'grid'
						? 'row'
						: 'listitem';
		const resolved = itemRole ?? expected;
		if (resolved !== expected && resolved !== 'presentation') {
			throw new Error(
				`ZVirtualList role="${role}" requires itemRole="${expected}" or "presentation".`
			);
		}
		if (itemSelected && resolved !== 'option' && resolved !== 'treeitem') {
			throw new Error('ZVirtualList itemSelected requires itemRole="option" or "treeitem".');
		}
		if ((itemExpanded || itemLevel || itemPosInSet || itemSetSize) && resolved !== 'treeitem') {
			throw new Error('ZVirtualList tree metadata callbacks require itemRole="treeitem".');
		}
		return resolved;
	});

	function currentEstimate(): VirtualSizeEstimate<TKey> {
		if (itemSize !== undefined && estimateSize !== undefined) {
			throw new TypeError('ZVirtualList itemSize and estimateSize are mutually exclusive.');
		}
		if (estimateSize === undefined) {
			const fixedSize = itemSize ?? 40;
			if (!Number.isFinite(fixedSize) || fixedSize <= 0) {
				throw new TypeError('Virtualizer itemSize must be positive and finite.');
			}
			return fixedSize;
		}
		if (typeof estimateSize === 'number') {
			if (!Number.isFinite(estimateSize) || estimateSize <= 0) {
				throw new TypeError('ZVirtualList estimateSize must be positive and finite.');
			}
			return estimateSize;
		}
		return (key, index) => {
			const current = normalized[index];
			if (!current || !Object.is(current.key, key)) {
				throw new Error('ZVirtualList estimate received a stale item index.');
			}
			return estimateSize(current.entry, index);
		};
	}

	function ariaInteger(value: number | undefined, name: string): number | undefined {
		if (value === undefined) return undefined;
		if (!Number.isInteger(value) || value < 1) {
			throw new TypeError(`ZVirtualList ${name} must return a positive integer.`);
		}
		return value;
	}

	if (untrack(() => initialIndex !== undefined && initialKey !== undefined)) {
		throw new TypeError('ZVirtualList initialIndex and initialKey are mutually exclusive.');
	}
	const virtualizer = new KeyedVirtualizer<TKey>({
		estimateSize: untrack(currentEstimate),
		keys: untrack(() => normalized.map(({ key }) => key)),
		overscan: untrack(() => overscan),
		viewportSize: untrack(() => ssrViewportSize ?? height)
	});
	if (untrack(() => initialKey !== undefined && virtualizer.indexOf(initialKey) < 0)) {
		throw new Error('ZVirtualList initialKey does not exist in items.');
	}
	let range = $state(virtualizer.range);

	const publicController: ZVirtualListController<TKey> = {
		get range() {
			return range;
		},
		ensureKey(key, align = 'nearest') {
			return scrollToKey(key, align, 'auto');
		},
		isRendered(key) {
			for (const mountedKey of itemElements.values()) {
				if (Object.is(mountedKey, key)) return true;
			}
			return false;
		},
		measure() {
			if (!dynamic) return;
			const previousOffset = virtualizer.scrollOffset;
			virtualizer.clearMeasurements();
			measureMountedItems();
			commitRange(previousOffset, true);
		},
		scrollToIndex(index, align = 'nearest', behavior = 'auto') {
			performScroll(() => virtualizer.scrollToIndex(index, align), behavior);
		},
		scrollToKey
	};

	const viewportClass = $derived(zui.recipe(viewportRecipe));
	const spacerClass = $derived(zui.recipe(spacerRecipe));
	const itemClass = $derived(zui.recipe(itemRecipe));
	const stateClass = $derived(zui.recipe(stateRecipe));
	const variables = $derived({
		...readIcssCarrier(rest),
		'--zui-virtual-list-height': `${height}px`,
		'--zui-virtual-list-total-size': `${range.totalSize}px`
	} as const);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	function publishRange(next: KeyedVirtualRange<TKey>): void {
		const unchanged =
			range.startIndex === next.startIndex &&
			range.endIndex === next.endIndex &&
			range.visibleStartIndex === next.visibleStartIndex &&
			range.visibleEndIndex === next.visibleEndIndex &&
			range.totalSize === next.totalSize &&
			range.items.length === next.items.length &&
			range.items.every((current, index) => {
				const candidate = next.items[index];
				return (
					candidate !== undefined &&
					Object.is(current.key, candidate.key) &&
					current.start === candidate.start &&
					current.size === candidate.size &&
					current.measured === candidate.measured
				);
			});
		if (!unchanged) range = next;
	}

	$effect(() => {
		if (itemSize !== undefined && estimateSize !== undefined) {
			throw new TypeError('ZVirtualList itemSize and estimateSize are mutually exclusive.');
		}
		if (initialIndex !== undefined && initialKey !== undefined) {
			throw new TypeError('ZVirtualList initialIndex and initialKey are mutually exclusive.');
		}
		const previousOffset = virtualizer.scrollOffset;
		virtualizer.update({
			estimateSize: currentEstimate(),
			keys: normalized.map(({ key }) => key),
			overscan
		});
		if (!dynamic) virtualizer.clearMeasurements();
		if (resizeObserver) {
			for (const element of itemElements.keys()) {
				if (dynamic) resizeObserver.observe(element);
				else resizeObserver.unobserve(element);
			}
		}
		commitRange(previousOffset, mounted);
	});
	$effect(() => {
		controller = publicController;
		const publishedController = untrack(() => controller);
		return () => {
			mounted = false;
			if (untrack(() => controller) === publishedController) controller = null;
		};
	});
	$effect(() => onRangeChange?.(range));

	function commitRange(previousOffset: number, synchronizeScroll: boolean): void {
		publishRange(virtualizer.range);
		if (
			synchronizeScroll &&
			ref &&
			Math.abs(virtualizer.scrollOffset - previousOffset) > 0.5 &&
			Math.abs(ref.scrollTop - virtualizer.scrollOffset) > 0.5
		) {
			ref.scrollTop = virtualizer.scrollOffset;
		}
	}

	function performScroll(target: () => number, behavior: VirtualListScrollBehavior): void {
		const previousOffset = virtualizer.scrollOffset;
		const offset = target();
		const resolvedBehavior = reduced && behavior === 'smooth' ? 'auto' : behavior;
		if (!ref || resolvedBehavior === 'auto') {
			commitRange(previousOffset, true);
			if (ref && Math.abs(ref.scrollTop - offset) > 0.5) ref.scrollTop = offset;
			return;
		}
		// Smooth scrolling follows real scroll events so intermediate windows stay mounted.
		virtualizer.setScrollOffset(ref.scrollTop);
		publishRange(virtualizer.range);
		ref.scrollTo({ behavior: 'smooth', top: offset });
	}

	function scrollToKey(
		key: TKey,
		align: VirtualAlign = 'nearest',
		behavior: VirtualListScrollBehavior = 'auto'
	): boolean {
		if (virtualizer.indexOf(key) < 0) return false;
		performScroll(() => {
			virtualizer.scrollToKey(key, align);
			return virtualizer.scrollOffset;
		}, behavior);
		return true;
	}

	function measuredBlockSize(entry: ResizeObserverEntry): number | undefined {
		// scrollTop is a physical vertical axis, so writing-mode blockSize is not interchangeable here.
		const size = entry.target.getBoundingClientRect().height;
		return Number.isFinite(size) && size > 0 ? size : undefined;
	}

	function applyMeasurements(measurements: readonly VirtualMeasurement<TKey>[]): void {
		if (!dynamic || measurements.length === 0) return;
		const previousOffset = virtualizer.scrollOffset;
		if (!virtualizer.measure(measurements)) return;
		commitRange(previousOffset, true);
	}

	function measureMountedItems(): void {
		const measurements: VirtualMeasurement<TKey>[] = [];
		for (const [element, key] of itemElements) {
			const size = element.getBoundingClientRect().height;
			if (Number.isFinite(size) && size > 0) measurements.push({ key, size });
		}
		applyMeasurements(measurements);
	}

	interface VirtualItemMountOptions {
		readonly key: TKey;
		readonly mount?: (key: TKey, element: HTMLElement) => void | (() => void);
	}

	function mountVirtualItem(element: HTMLElement, options: VirtualItemMountOptions) {
		let current = options;
		itemElements.set(element, current.key);
		if (dynamic) resizeObserver?.observe(element);
		let cleanup: void | (() => void);
		try {
			cleanup = current.mount?.(current.key, element);
		} catch (error) {
			resizeObserver?.unobserve(element);
			itemElements.delete(element);
			throw error;
		}
		return {
			destroy() {
				try {
					cleanup?.();
				} finally {
					resizeObserver?.unobserve(element);
					itemElements.delete(element);
				}
			},
			update(next: VirtualItemMountOptions) {
				if (Object.is(current.key, next.key) && current.mount === next.mount) return;
				try {
					cleanup?.();
				} finally {
					current = next;
					itemElements.set(element, current.key);
					cleanup = current.mount?.(current.key, element);
				}
			}
		};
	}

	function handleScroll(event: UIEvent & { currentTarget: EventTarget & HTMLDivElement }): void {
		onscroll?.(event);
		virtualizer.setScrollOffset(event.currentTarget.scrollTop);
		publishRange(virtualizer.range);
	}

	onMount(() => {
		mounted = true;
		if (!ref) return;
		const ownerDocument = ref.ownerDocument;
		const view = ownerDocument.defaultView;
		if (!view) return;
		const disconnectMotion = reducedMotion.connect(view);
		const ResizeObserverConstructor = view.ResizeObserver;
		const resizeFallback = (): void => {
			if (!ref) return;
			const previousOffset = virtualizer.scrollOffset;
			if (dynamic && Math.abs(ref.clientWidth - viewportWidth) > 0.5) {
				viewportWidth = ref.clientWidth;
				virtualizer.clearMeasurements();
			}
			virtualizer.setViewportSize(ref.clientHeight || height);
			measureMountedItems();
			commitRange(previousOffset, true);
		};
		if (ResizeObserverConstructor) {
			viewportWidth = ref.clientWidth;
			resizeObserver = new ResizeObserverConstructor((entries) => {
				const measurements: VirtualMeasurement<TKey>[] = [];
				const previousOffset = virtualizer.scrollOffset;
				for (const entry of entries) {
					if (entry.target === ref) {
						if (dynamic && Math.abs(ref.clientWidth - viewportWidth) > 0.5) {
							viewportWidth = ref.clientWidth;
							virtualizer.clearMeasurements();
						}
						virtualizer.setViewportSize(ref.clientHeight || height);
						continue;
					}
					const key = itemElements.get(entry.target as HTMLElement);
					const size = measuredBlockSize(entry);
					if (key !== undefined && size !== undefined) measurements.push({ key, size });
				}
				if (dynamic) virtualizer.measure(measurements);
				commitRange(previousOffset, true);
			});
			resizeObserver.observe(ref);
			if (dynamic) for (const element of itemElements.keys()) resizeObserver.observe(element);
		} else {
			viewportWidth = ref.clientWidth;
			view.addEventListener('resize', resizeFallback);
		}
		const fonts = ownerDocument.fonts;
		const refreshMeasurements = (): void => {
			if (mounted) publicController.measure();
		};
		fonts?.addEventListener('loadingdone', refreshMeasurements);
		fonts?.addEventListener('loadingerror', refreshMeasurements);
		void fonts?.ready.then(refreshMeasurements);

		const previousOffset = virtualizer.scrollOffset;
		virtualizer.setViewportSize(ref.clientHeight || height);
		if (dynamic) measureMountedItems();
		commitRange(previousOffset, true);
		if (initialKey !== undefined) {
			scrollToKey(initialKey, 'start');
		} else if (initialIndex !== undefined) {
			publicController.scrollToIndex(initialIndex, 'start');
		}

		return () => {
			mounted = false;
			resizeObserver?.disconnect();
			resizeObserver = undefined;
			view.removeEventListener('resize', resizeFallback);
			disconnectMotion();
			fonts?.removeEventListener('loadingdone', refreshMeasurements);
			fonts?.removeEventListener('loadingerror', refreshMeasurements);
			itemElements.clear();
		};
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (role=list is a keyboard-scrollable viewport) -->
<div
	{...rest}
	bind:this={ref}
	class={[viewportClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	{role}
	tabindex={tabindex ?? (role === 'list' ? 0 : undefined)}
	aria-label={resolvedAriaLabel}
	aria-labelledby={ariaLabelledBy}
	aria-busy={loading ? 'true' : ariaBusy}
	aria-rowcount={role === 'grid' ? normalized.length : undefined}
	data-dynamic={dynamic || undefined}
	data-item-role={resolvedItemRole}
	data-reduced-motion={reduced || undefined}
	data-range-start={range.startIndex}
	data-range-end={range.endIndex}
	data-visible-start={range.visibleStartIndex}
	data-visible-end={range.visibleEndIndex}
	onscroll={handleScroll}
>
	<div class={spacerClass} data-slot="spacer">
		{#each range.items as virtual (virtual.key)}
			{@const currentIndex = normalized.findIndex(({ key }) => Object.is(key, virtual.key))}
			{@const current = currentIndex >= 0 ? normalized[currentIndex] : undefined}
			{#if current}
				{@const disabled = itemDisabled?.(current.entry, currentIndex) ?? false}
				{@const expanded = itemExpanded?.(current.entry, currentIndex)}
				{@const level = ariaInteger(itemLevel?.(current.entry, currentIndex), 'itemLevel')}
				{@const posInSet = ariaInteger(itemPosInSet?.(current.entry, currentIndex), 'itemPosInSet')}
				{@const selected = itemSelected?.(current.entry, currentIndex)}
				{@const setSize = ariaInteger(itemSetSize?.(current.entry, currentIndex), 'itemSetSize')}
				<div
					class={itemClass}
					data-slot="item"
					data-virtual-index={currentIndex}
					data-measured={virtual.measured || undefined}
					data-disabled={disabled || undefined}
					data-key={String(virtual.key)}
					id={current.id}
					role={resolvedItemRole}
					aria-disabled={resolvedItemRole === 'presentation' ? undefined : disabled || undefined}
					aria-expanded={resolvedItemRole === 'treeitem' ? expanded : undefined}
					aria-level={resolvedItemRole === 'treeitem' ? level : undefined}
					aria-selected={resolvedItemRole === 'option'
						? (selected ?? false)
						: resolvedItemRole === 'treeitem'
							? selected
							: undefined}
					aria-posinset={resolvedItemRole === 'presentation' || resolvedItemRole === 'row'
						? undefined
						: (posInSet ?? currentIndex + 1)}
					aria-setsize={resolvedItemRole === 'presentation' || resolvedItemRole === 'row'
						? undefined
						: (setSize ?? normalized.length)}
					aria-rowindex={resolvedItemRole === 'row' ? currentIndex + 1 : undefined}
					style={`${dynamic ? '' : `height: ${virtual.size}px; `}transform: translateY(${virtual.start}px);`}
					use:mountVirtualItem={{ key: virtual.key, mount: onItemMount }}
				>
					{@render item(current.entry, currentIndex, virtual)}
				</div>
			{/if}
		{/each}
	</div>
</div>
{#if normalized.length === 0 && loading && loadingContent}
	<div class={stateClass} data-slot="loading" role="status">{@render loadingContent()}</div>
{:else if normalized.length === 0 && empty}
	<div class={stateClass} data-slot="empty" role="status">{@render empty()}</div>
{/if}
