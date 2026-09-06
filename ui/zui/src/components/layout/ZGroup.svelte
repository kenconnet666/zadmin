<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { ZStackProps } from './ZStack.svelte';

	export interface ZGroupProps extends Omit<ZStackProps, 'direction'> {
		readonly itemSizing?: 'auto' | 'equal' | 'grow';
		readonly preventGrowOverflow?: boolean;
	}

	export const zuiMetadata = {
		bindings: [{ description: '真实div组容器引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		category: 'layout',
		dependencies: ['ZStack row layout', 'typed responsive CSS'],
		events: [],
		id: 'group',
		importStatement: "import { ZGroup } from '@zadmin/zui';",
		keyboard: [],
		name: 'ZGroup',
		parts: [],
		props: [
			{
				default: "'auto'",
				description:
					'直接子项宽度策略：auto保留内容尺寸，grow以内容为basis共同增长，equal以零basis平均占用可用行宽。',
				name: 'itemSizing',
				type: "'auto' | 'grow' | 'equal'"
			},
			{
				default: 'true',
				description:
					'给直接子项min-inline-size:0和max-inline-size:100%，让弹性盒而非min-content决定可收缩宽度。内容仍由调用方换行或截断。',
				name: 'preventGrowOverflow',
				type: 'boolean'
			},
			{
				default: "'medium'",
				description: '固定row方向下的双轴间距，支持响应式Theme spacing或非负px。',
				name: 'gap',
				type: 'ResponsiveValue<ZLayoutSpacing>'
			},
			{
				default: "'center'",
				description: '固定row方向的交叉轴对齐，支持响应式配置。',
				name: 'align',
				type: 'ResponsiveValue<ZStackAlignment>'
			},
			{
				default: "'start'",
				description: '固定row方向的主轴分布，支持响应式配置。',
				name: 'justify',
				type: 'ResponsiveValue<ZStackJustification>'
			},
			{
				default: 'false',
				description: '固定row方向是否换行，支持true或reverse响应式配置。',
				name: 'wrap',
				type: "ResponsiveValue<boolean | 'reverse'>"
			},
			{
				default: "'viewport'",
				description: '响应式参照；viewport或已命名的祖先CSS容器。',
				name: 'query',
				type: 'ResponsiveQuery'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实div组容器引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: '按原始DOM顺序自动放置的直接子项。', name: 'children', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/layout/ZGroup.svelte',
		states: [
			{
				description: '直接子项宽度策略。',
				name: 'data-item-sizing',
				values: ['auto', 'equal', 'grow']
			},
			{
				description: '直接子项是否可绕过min-content宽度收缩。',
				name: 'data-prevent-grow-overflow',
				values: ['true']
			}
		],
		status: 'experimental',
		summary: '固定row方向的ZStack便利层，明确普通、内容基准增长和平均宽度三种直接子项策略。'
	} as const satisfies ZuiComponentMetadata;

	const groupRecipe = defineRecipe({
		base: (s) => {
			s._selector('& > *', (s) => s.boxSizing.borderBox);
		},
		variants: {
			itemSizing: {
				auto: () => undefined,
				equal: (s) => s._selector('& > *', (s) => s.flex.raw('1 1 0')),
				grow: (s) => s._selector('& > *', (s) => s.flex.raw('1 1 auto'))
			},
			preventGrowOverflow: {
				false: () => undefined,
				true: (s) =>
					s._selector('& > *', (s) => {
						s.maxInlineSize.percent(100);
						s.minInlineSize.px(0);
					})
			}
		},
		defaultVariants: { itemSizing: 'auto', preventGrowOverflow: true }
	});

	registerRecipeHmr(import.meta, groupRecipe);
</script>

<script lang="ts">
	import { useZui } from '../../runtime/foundation/context.js';
	import ZStack from './ZStack.svelte';

	let {
		align = 'center',
		children,
		class: className,
		columnGap,
		gap = 'medium',
		itemSizing = 'auto',
		justify = 'start',
		preventGrowOverflow = true,
		query = 'viewport',
		ref = $bindable(null),
		rowGap,
		style,
		wrap = false,
		...rest
	}: ZGroupProps = $props();

	const zui = useZui();
	const resolvedItemSizing = $derived.by(() => {
		if (!['auto', 'equal', 'grow'].includes(itemSizing)) {
			throw new TypeError('ZGroup itemSizing must be auto, grow or equal.');
		}
		return itemSizing;
	});
	const rootClass = $derived(
		zui.recipe(groupRecipe, { itemSizing: resolvedItemSizing, preventGrowOverflow })
	);
</script>

<ZStack
	{...rest}
	bind:ref
	{align}
	class={[rootClass, className]}
	{columnGap}
	direction="row"
	{gap}
	{justify}
	{query}
	{rowGap}
	{style}
	{wrap}
	data-item-sizing={resolvedItemSizing}
	data-prevent-grow-overflow={preventGrowOverflow || undefined}
>
	{@render children?.()}
</ZStack>
