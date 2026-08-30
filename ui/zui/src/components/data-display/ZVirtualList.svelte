<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { VirtualRange } from '../../runtime/collection/virtualizer.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export interface ZVirtualListProps<TItem = unknown> extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children'
	> {
		readonly ariaLabel: string;
		readonly height?: number;
		readonly initialIndex?: number;
		readonly item: Snippet<[TItem, number]>;
		readonly itemKey: (item: TItem, index: number) => number | string;
		readonly itemSize?: number;
		readonly items: readonly TItem[];
		readonly onRangeChange?: (range: VirtualRange) => void;
		readonly overscan?: number;
		ref?: HTMLDivElement | null;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'virtual-list',
		importStatement: "import { ZVirtualList } from '@zadmin/zui';",
		name: 'ZVirtualList',
		bindings: [
			{ description: '真实滚动viewport引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['fixed-size virtualizer', 'ResizeObserver', 'stable item keys'],
		events: [
			{
				description: '可见区间变化。',
				name: 'onRangeChange',
				type: '(range: VirtualRange) => void'
			}
		],
		keyboard: [],
		parts: [
			{ description: '总高度spacer。', name: 'spacer' },
			{ description: '绝对定位可见项。', name: 'item' }
		],
		props: [
			{
				default: '必填',
				description: '数据项。',
				name: 'items',
				required: true,
				type: 'readonly TItem[]'
			},
			{
				default: '必填',
				description: '稳定业务key。',
				name: 'itemKey',
				required: true,
				type: '(item: TItem, index: number) => string | number'
			},
			{ default: '40', description: '固定项高px。', name: 'itemSize', type: 'number' },
			{ default: '320', description: 'viewport高度px。', name: 'height', type: 'number' },
			{ default: '4', description: '上下overscan项数。', name: 'overscan', type: 'number' }
		],
		since: '0.8.0',
		snippets: [{ description: '可见项正文。', name: 'item', type: 'Snippet<[TItem, number]>' }],
		source: 'ui/zui/src/components/data-display/ZVirtualList.svelte',
		states: [
			{ description: '首个渲染索引。', name: 'data-range-start', values: ['number'] },
			{ description: '排他结束索引。', name: 'data-range-end', values: ['number'] }
		],
		status: 'experimental',
		summary: '以稳定key、固定项高、overscan和ResizeObserver提供可预测窗口化的Virtual List。'
	} as const satisfies ZuiComponentMetadata;
	const viewportRecipe = defineRecipe({
		base: (s) => {
			s.height.raw('var(--zui-virtual-list-height)');
			s.overflow.auto;
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
			s.insetInlineStart.px(0);
			s.position.absolute;
			s.width.percent(100);
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, viewportRecipe);
	registerRecipeHmr(import.meta, spacerRecipe);
	registerRecipeHmr(import.meta, itemRecipe);
</script>

<script lang="ts" generics="TItem">
	/* eslint-disable svelte/prefer-svelte-reactivity -- The Set validates stable keys. */
	import { onMount, untrack } from 'svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import {
		calculateVirtualRange,
		virtualScrollOffset
	} from '../../runtime/collection/virtualizer.js';
	let {
		ariaLabel,
		class: className,
		height = 320,
		initialIndex = 0,
		item,
		itemKey,
		itemSize = 40,
		items,
		onRangeChange,
		overscan = 4,
		ref = $bindable(null),
		style,
		...rest
	}: ZVirtualListProps<TItem> = $props();
	const zui = useZui();
	let scrollOffset = $state(0);
	let viewportSize = $state(height);
	const validated = $derived.by(() => {
		const keys = new Set<number | string>();
		items.forEach((entry, index) => {
			const key = itemKey(entry, index);
			if (keys.has(key)) throw new Error(`Duplicate ZVirtualList key "${key}".`);
			keys.add(key);
		});
		return items;
	});
	const range = $derived(
		calculateVirtualRange({
			count: validated.length,
			itemSize,
			overscan,
			scrollOffset,
			viewportSize
		})
	);
	const viewportClass = $derived(zui.recipe(viewportRecipe));
	const spacerClass = $derived(zui.recipe(spacerRecipe));
	const itemClass = $derived(zui.recipe(itemRecipe));
	const variables = $derived({
		...readIcssCarrier(rest),
		'--zui-virtual-list-height': `${height}px`,
		'--zui-virtual-list-total-size': `${range.totalSize}px`
	} as const);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() => onRangeChange?.(range));
	onMount(() => {
		if (!ref) return;
		const observer = new ResizeObserver(() => {
			if (ref) viewportSize = ref.clientHeight;
		});
		observer.observe(ref);
		const offset = virtualScrollOffset(initialIndex, {
			count: validated.length,
			itemSize,
			viewportSize,
			align: 'start'
		});
		ref.scrollTop = offset;
		scrollOffset = offset;
		return () => observer.disconnect();
	});
</script>

<div
	{...rest}
	bind:this={ref}
	class={[viewportClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="list"
	aria-label={ariaLabel}
	data-range-start={range.startIndex}
	data-range-end={range.endIndex}
	onscroll={(event) => (scrollOffset = event.currentTarget.scrollTop)}
>
	<div class={spacerClass} data-slot="spacer">
		{#each range.items as virtual (itemKey(validated[virtual.index]!, virtual.index))}<div
				class={itemClass}
				data-slot="item"
				role="listitem"
				aria-posinset={virtual.index + 1}
				aria-setsize={validated.length}
				style={`height: ${virtual.size}px; transform: translateY(${virtual.start}px);`}
			>
				{@render item(validated[virtual.index]!, virtual.index)}
			</div>{/each}
	</div>
</div>
