<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { assertSelectionKey, type SelectionKey } from '../../runtime/collection/selection.js';
	import type { OverflowCollapseFrom } from '../../runtime/collection/overflow-layout.js';
	import type { ResponsiveQuery, ResponsiveValue } from '../../runtime/foundation/responsive.js';
	import type { ZLayoutSpacing } from '../../runtime/foundation/layout.js';
	import { defineSlotRecipe } from '../../recipes/slots.js';

	export interface OverflowListState<TItem, TKey extends SelectionKey = SelectionKey> {
		readonly visibleItems: readonly TItem[];
		readonly overflowItems: readonly TItem[];
		readonly visibleKeys: readonly TKey[];
		readonly overflowKeys: readonly TKey[];
		readonly measured: boolean;
		readonly fits: boolean;
		readonly rows: number;
	}
	export interface ZOverflowListProps<TItem, TKey extends SelectionKey = SelectionKey> extends Omit<
		HTMLAttributes<HTMLElement>,
		'children'
	> {
		readonly as?: 'div' | 'ol' | 'ul';
		readonly collapse?: boolean;
		readonly items: readonly TItem[];
		readonly itemKey: (item: TItem, index: number) => TKey;
		readonly item: Snippet<[item: TItem, index: number]>;
		readonly overflow: Snippet<[state: OverflowListState<TItem, TKey>]>;
		readonly maxRows?: number;
		readonly maxVisibleItems?: number;
		readonly collapseFrom?: OverflowCollapseFrom;
		readonly pinnedKeys?: readonly NoInfer<TKey>[];
		readonly suspended?: boolean;
		readonly gap?: ResponsiveValue<ZLayoutSpacing>;
		readonly rowGap?: ResponsiveValue<ZLayoutSpacing>;
		readonly query?: ResponsiveQuery;
		readonly onVisibleItemsChange?: (state: OverflowListState<TItem, TKey>) => void;
		ref?: HTMLElement | null;
	}
	export const zuiMetadata = {
		category: 'layout',
		id: 'overflow-list',
		name: 'ZOverflowList',
		since: 'unreleased',
		status: 'experimental',
		source: 'ui/zui/src/components/layout/ZOverflowList.svelte',
		importStatement: "import { ZOverflowList } from '@zadmin/zui';",
		summary: '以真实CSS布局尺寸折叠行内集合，保留唯一DOM实例、逻辑顺序、固定项目和可访问溢出入口。',
		dependencies: ['owner Window ResizeObserver', 'tabbable'],
		bindings: [
			{ name: 'ref', type: 'HTMLElement | null', description: '真实div/ol/ul集合根节点。' }
		],
		events: [
			{
				name: 'onVisibleItemsChange',
				type: '(state: OverflowListState<TItem, TKey>) => void',
				description: '客户端实际拆分或约束结果改变后通知；SSR不伪造测量事件。'
			}
		],
		keyboard: [
			{
				key: 'Tab / Shift+Tab',
				description:
					'保留可见子项和溢出入口的原生焦点顺序；隐藏项inert且aria-hidden，必要时转移焦点。'
			}
		],
		parts: [
			{ name: 'item', description: '每项唯一wrapper，隐藏时移出flow但保留测量和内部状态。' },
			{ name: 'overflow', description: '唯一溢出入口wrapper，DOM中位于首个被折叠项目处。' }
		],
		states: [
			{
				name: 'data-overflow-hidden',
				values: ['true'],
				description: '不可交互且不可访问的测量项。'
			},
			{ name: 'data-measured', values: ['true'], description: '已有客户端测量。' },
			{
				name: 'data-fits',
				values: ['true', 'false'],
				description: '是否满足行数、数量和可用宽度；固定项目可能令约束不可满足。'
			}
		],
		props: [
			{
				name: 'collapse',
				type: 'boolean',
				default: 'true',
				description: 'false完整显示且停止测量；与suspended保留现有拆分不同。'
			},
			{
				name: 'as',
				type: "'div' | 'ol' | 'ul'",
				default: "'div'",
				description: '语义根元素；ol/ul自动使用li wrapper。'
			},
			{
				name: 'items',
				type: 'readonly TItem[]',
				default: '必填',
				required: true,
				description: '有序数据，由调用方拥有。',
				opaque: {
					kind: 'caller-generic',
					resolution: 'generic-unexpanded',
					type: 'readonly TItem[]',
					genericParameters: ['TItem'],
					reason: '项目结构由调用方定义。',
					owner: 'caller'
				}
			},
			{
				name: 'itemKey',
				type: '(item: TItem, index: number) => TKey',
				default: '必填',
				required: true,
				description: '唯一稳定string/number身份，保留1和"1"区别。'
			},
			{
				name: 'maxRows',
				type: 'number',
				default: '1',
				description:
					'正整数flex行数预算，不是文本行数；无法容纳固定项目时自然换行并报告fits=false。'
			},
			{
				name: 'maxVisibleItems',
				type: 'number',
				default: '—',
				description: '非负可见数量上限；固定项目不会为此被隐藏。'
			},
			{
				name: 'collapseFrom',
				type: "'start' | 'end'",
				default: "'end'",
				description: '按数据逻辑顺序移除未固定项目，RTL不反转数据。'
			},
			{
				name: 'pinnedKeys',
				type: 'readonly NoInfer<TKey>[]',
				default: '[]',
				description: '始终保留的项目，如当前页；数据暂未包含的key等待后续项目出现。'
			},
			{
				name: 'suspended',
				type: 'boolean',
				default: 'false',
				description: '复杂交互/Portal打开期间保留当前拆分；关闭后恢复测量。'
			},
			{
				name: 'gap',
				type: 'ResponsiveValue<ZLayoutSpacing>',
				default: "'small'",
				description: '行内间距，真实计算样式参与测量。'
			},
			{
				name: 'rowGap',
				type: 'ResponsiveValue<ZLayoutSpacing>',
				default: "'small'",
				description: '行之间的间距。'
			},
			{
				name: 'query',
				type: 'ResponsiveQuery',
				default: "'viewport'",
				description: '响应式间距的视口或命名容器参照。'
			},
			{
				name: 'onVisibleItemsChange',
				type: '(state: OverflowListState<TItem, TKey>) => void',
				default: '—',
				description: '实际拆分改变的只读快照；不会只因相同布局的ResizeObserver重复通知。'
			},
			{
				name: 'ref',
				type: 'HTMLElement | null',
				default: 'null',
				bindable: true,
				description: '真实集合根引用。'
			}
		],
		snippets: [
			{
				name: 'item',
				type: 'Snippet<[TItem, number]>',
				required: true,
				description: '每项只挂载一次，原始index不随折叠改变。'
			},
			{
				name: 'overflow',
				type: 'Snippet<[OverflowListState<TItem, TKey>]>',
				required: true,
				description: '提供真实溢出交互或计数；收到完整被折叠数据，入口只挂载一次。'
			}
		]
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineSlotRecipe(
		{
			slots: ['root', 'item', 'overflow'] as const,
			variants: {},
			base: {
				root: (s) => {
					s.display.flex;
					s.flexWrap.wrap;
					s.alignItems.center;
					s.position.relative;
					s.minWidth.px(0);
					s.maxWidth.percent(100);
					s.padding.px(0);
					s.margin.px(0);
					s.listStyleType.none;
				},
				item: wrapper,
				overflow: wrapper
			}
		},
		import.meta
	);
	function wrapper(
		s: import('../../icss/types.js').IcssStyle<import('../../theme/types.js').ZuiTheme>
	): void {
		s.display.flex;
		s.flex.raw('0 0 auto');
		s.inlineSize.maxContent;
		s.maxInlineSize.raw('var(--zui-overflow-available, 100%)');
		s.minInlineSize.px(0);
		s.boxSizing.borderBox;
		s.overflowWrap.anywhere;
		s._selector('&[data-overflow-hidden="true"]', (s) => {
			s.position.absolute;
			s.insetInlineStart.px(0);
			s.insetBlockStart.px(0);
			s.visibility.hidden;
			s.overflow.clip;
			s.pointerEvents.none;
		});
	}
</script>

<script lang="ts" generics="TItem, TKey extends SelectionKey = SelectionKey">
	import { onDestroy, tick, untrack } from 'svelte';
	import { focusable, isFocusable, tabbable } from 'tabbable';
	import { containsComposedNode, getActiveElement } from '../../runtime/layer/dom-realm.js';
	import { OverflowMeasurement } from '../../runtime/collection/overflow-measure.js';
	import {
		assertOverflowCount,
		sameOverflowLayout,
		type OverflowLayout
	} from '../../runtime/collection/overflow-layout.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { applyResponsiveStyles } from '../../runtime/foundation/responsive.js';
	import { applyLayoutSpacing } from '../../runtime/foundation/layout.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';

	let {
		as = 'div',
		collapse = true,
		items,
		itemKey,
		item,
		overflow,
		maxRows = 1,
		maxVisibleItems,
		collapseFrom = 'end',
		pinnedKeys = [],
		suspended = false,
		gap = 'small',
		rowGap = 'small',
		query = 'viewport',
		onVisibleItemsChange,
		ref = $bindable(null),
		class: className,
		dir,
		style,
		role,
		tabindex = -1,
		...rest
	}: ZOverflowListProps<TItem, TKey> = $props();
	const zui = useZui();
	const OVERFLOW_KEY = Symbol('overflow');
	let layout = $state.raw<OverflowLayout<TKey> | null>(null);
	let measured = $state(false);
	let heldKey = $state<TKey | undefined>();
	let holdOverflow = $state(false);
	let sequence = 0;
	let outsideInteraction = 0;
	let connectionVersion = $state(0);
	let remembered: { element: HTMLElement; interaction: number } | null = null;
	const entries = $derived.by(() => {
		assertOverflowCount(maxRows, 'maxRows', 1);
		if (maxVisibleItems !== undefined) assertOverflowCount(maxVisibleItems, 'maxVisibleItems', 0);
		if (!['div', 'ol', 'ul'].includes(as) || !['start', 'end'].includes(collapseFrom))
			throw new TypeError('Invalid OverflowList layout configuration.');
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Temporary identity validation for the current item projection.
		const keys = new Set<TKey>();
		for (const key of pinnedKeys) assertSelectionKey(key, 'OverflowList pinned');
		return items.map((value, index) => {
			const key = itemKey(value, index);
			assertSelectionKey(key, 'OverflowList');
			if (keys.has(key)) throw new TypeError('OverflowList requires unique keys.');
			keys.add(key);
			return { key, value, index };
		});
	});
	const hidden = $derived(new Set<TKey>(collapse ? (layout?.overflowKeys ?? []) : []));
	const snapshot = $derived<OverflowListState<TItem, TKey>>({
		visibleItems: entries.filter((entry) => !hidden.has(entry.key)).map((entry) => entry.value),
		overflowItems: entries.filter((entry) => hidden.has(entry.key)).map((entry) => entry.value),
		visibleKeys: entries.filter((entry) => !hidden.has(entry.key)).map((entry) => entry.key),
		overflowKeys: entries.filter((entry) => hidden.has(entry.key)).map((entry) => entry.key),
		measured: collapse && measured,
		fits: collapse ? (layout?.fits ?? true) : true,
		rows: collapse ? (layout?.rows ?? 0) : 0
	});
	const rendered = $derived.by(() => {
		const result: (
			| { kind: 'item'; key: TKey; value: TItem; index: number }
			| { kind: 'overflow'; key: typeof OVERFLOW_KEY }
		)[] = entries.map((entry) => ({ ...entry, kind: 'item' }));
		const firstHidden = entries.findIndex((entry) => hidden.has(entry.key));
		const index = firstHidden >= 0 ? firstHidden : collapseFrom === 'start' ? 0 : entries.length;
		if (collapse || holdOverflow || suspended)
			result.splice(index, 0, { kind: 'overflow', key: OVERFLOW_KEY });
		return result;
	});
	function activeElement(): HTMLElement | null {
		const active = ref ? getActiveElement(ref) : null;
		return active && 'focus' in active ? (active as HTMLElement) : null;
	}
	function captureFocus(): void {
		const active = activeElement();
		remembered =
			active && containsComposedNode(ref, active)
				? { element: active, interaction: outsideInteraction }
				: null;
	}
	function focusInside(node: HTMLElement | null): boolean {
		if (!node) return false;
		const options = { getShadowRoot: (element: Element) => element.shadowRoot ?? false };
		const target = tabbable(node, options)[0] ?? focusable(node, options)[0];
		if (!target) return false;
		(target as HTMLElement).focus({ preventScroll: true });
		return true;
	}
	function publish(next: OverflowLayout<TKey>, fromMeasurement = true): boolean {
		if (measured === fromMeasurement && sameOverflowLayout(layout, next)) return false;
		const id = ++sequence;
		const active = activeElement();
		const previousFocus =
			active && containsComposedNode(ref, active)
				? { element: active, interaction: outsideInteraction }
				: remembered;
		const focusedItem =
			previousFocus &&
			[...measurement.itemElements].find(([, node]) =>
				containsComposedNode(node, previousFocus.element)
			);
		const losingItem = focusedItem && next.overflowKeys.includes(focusedItem[0]);
		const losingOverflow =
			previousFocus &&
			containsComposedNode(measurement.overflowElement, previousFocus.element) &&
			next.overflowKeys.length === 0;
		heldKey = losingItem ? focusedItem[0] : undefined;
		holdOverflow = Boolean(losingOverflow);
		layout = next;
		measured = fromMeasurement;
		void tick().then(async () => {
			if (id !== sequence || !ref?.isConnected) return;
			const now = activeElement();
			if (
				previousFocus &&
				previousFocus.interaction === outsideInteraction &&
				(now === previousFocus.element || now === ref.ownerDocument.body || now === ref)
			) {
				if (losingItem) {
					if (!focusInside(measurement.overflowElement)) ref.focus({ preventScroll: true });
				} else if (losingOverflow) {
					const first = next.visibleKeys
						.map((key) => measurement.itemElements.get(key))
						.find((node) => node && focusInside(node));
					if (!first) ref.focus({ preventScroll: true });
				} else if (previousFocus.element.isConnected && isFocusable(previousFocus.element))
					previousFocus.element.focus({ preventScroll: true });
			}
			heldKey = undefined;
			holdOverflow = false;
			remembered = null;
			await tick();
			if (id !== sequence || !ref?.isConnected) return;
			onVisibleItemsChange?.(snapshot);
		});
		return true;
	}
	const measurement = new OverflowMeasurement<TKey>(
		() => ({
			keys: entries.map((entry) => entry.key),
			maxRows,
			maxVisibleItems,
			collapseFrom,
			pinnedKeys,
			suspended
		}),
		publish
	);
	function registerItem(node: HTMLElement, key: TKey) {
		return { destroy: measurement.registerItem(key, node) };
	}
	function registerOverflow(node: HTMLElement) {
		return { destroy: measurement.registerOverflow(node) };
	}
	$effect.pre(() => {
		const keys = entries.map((entry) => entry.key);
		const enabled = collapse;
		untrack(() => {
			captureFocus();
			if (!enabled)
				publish(
					{
						visibleKeys: keys,
						overflowKeys: [],
						overflowIndex: keys.length,
						rows: 0,
						fits: true
					},
					false
				);
		});
	});
	$effect(() => {
		const root = ref;
		const enabled = collapse;
		zui.portalContainer;
		connectionVersion;
		return untrack(() => measurement.connect(enabled ? root : null));
	});
	$effect(() => {
		rendered;
		void tick().then(() => {
			const previous = remembered;
			if (!ref?.isConnected || !previous || previous.interaction !== outsideInteraction) return;
			const active = activeElement();
			if (
				(active === ref.ownerDocument.body || active === ref) &&
				previous.element.isConnected &&
				isFocusable(previous.element)
			)
				previous.element.focus({ preventScroll: true });
		});
	});
	$effect(() => {
		entries;
		maxRows;
		maxVisibleItems;
		collapseFrom;
		pinnedKeys;
		suspended;
		gap;
		rowGap;
		query;
		untrack(() => measurement.invalidate());
	});
	$effect(() => {
		const root = ref;
		zui.portalContainer;
		connectionVersion;
		if (!root) return;
		const document = root.ownerDocument;
		const outside = (event: PointerEvent) => {
			if (!event.composedPath().includes(root)) outsideInteraction += 1;
		};
		document.addEventListener('pointerdown', outside, true);
		return () => document.removeEventListener('pointerdown', outside, true);
	});
	/** Re-measures explicit external stylesheet changes without changing data or focus ownership. */
	export function refresh(): void {
		connectionVersion += 1;
	}
	onDestroy(() => {
		sequence += 1;
		measurement.disconnect();
	});
	const classes = $derived(zui.slots(recipe));
	const gapClass = $derived(
		zui.icss((s) => {
			s.columnGap._small;
			s.rowGap._small;
			applyResponsiveStyles(s, gap, (s, value) => applyLayoutSpacing(s, 'columnGap', value), query);
			applyResponsiveStyles(s, rowGap, (s, value) => applyLayoutSpacing(s, 'rowGap', value), query);
		})
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<svelte:element
	this={as}
	{...rest}
	bind:this={ref}
	class={[classes.root, gapClass, className]}
	dir={dir ?? zui.direction}
	{tabindex}
	role={role ?? (as === 'div' ? undefined : 'list')}
	data-measured={snapshot.measured || undefined}
	data-fits={snapshot.measured ? snapshot.fits : undefined}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
>
	{#each rendered as entry (entry.key)}
		{#if entry.kind === 'item'}
			{@const concealed = hidden.has(entry.key) && entry.key !== heldKey}
			<svelte:element
				this={as === 'div' ? 'div' : 'li'}
				class={classes.item}
				data-slot="item"
				data-key={String(entry.key)}
				data-key-type={typeof entry.key}
				data-overflow-hidden={concealed || undefined}
				aria-hidden={concealed || undefined}
				inert={concealed}
				use:registerItem={entry.key}
			>
				{@render item(entry.value, entry.index)}
			</svelte:element>
		{:else}
			{@const concealed =
				snapshot.overflowKeys.length === 0 &&
				!holdOverflow &&
				!(suspended && (layout?.overflowKeys.length ?? 0) > 0)}
			<svelte:element
				this={as === 'div' ? 'div' : 'li'}
				class={classes.overflow}
				data-slot="overflow"
				data-overflow-hidden={concealed || undefined}
				aria-hidden={concealed || undefined}
				inert={concealed}
				use:registerOverflow
			>
				{@render overflow(snapshot)}
			</svelte:element>
		{/if}
	{/each}
</svelte:element>
