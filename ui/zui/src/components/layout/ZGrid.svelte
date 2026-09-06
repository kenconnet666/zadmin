<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ResponsiveQuery, ResponsiveValue } from '../../runtime/foundation/responsive.js';
	import type { ZLayoutAlignment, ZLayoutSpacing } from '../../runtime/foundation/layout.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export interface ZGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly children?: Snippet;
		readonly columns?: ResponsiveValue<number>;
		readonly gap?: ResponsiveValue<ZLayoutSpacing>;
		readonly rowGap?: ResponsiveValue<ZLayoutSpacing>;
		readonly columnGap?: ResponsiveValue<ZLayoutSpacing>;
		readonly align?: ResponsiveValue<ZLayoutAlignment>;
		readonly query?: ResponsiveQuery;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		category: 'layout',
		id: 'grid',
		name: 'ZGrid',
		status: 'experimental',
		since: 'unreleased',
		source: 'ui/zui/src/components/layout/ZGrid.svelte',
		importStatement: "import { ZGrid, ZGridItem } from '@zadmin/zui';",
		summary: '响应式CSS栅格，支持任意列数、跨列布局与命名容器查询。',
		dependencies: [],
		events: [],
		keyboard: [],
		parts: [],
		states: [],
		bindings: [{ name: 'ref', type: 'HTMLDivElement | null', description: '真实栅格div引用。' }],
		snippets: [
			{ name: 'children', type: 'Snippet', description: '栅格项；使用ZGridItem声明跨列与起始列。' }
		],
		props: [
			{
				name: 'columns',
				type: 'ResponsiveValue<number>',
				default: '12',
				description: '正整数列数；base/small/medium/large依次覆盖。'
			},
			{
				name: 'gap',
				type: 'ResponsiveValue<ZLayoutSpacing>',
				default: "'medium'",
				description: '双轴间距；通用Theme间距token或非负px值。'
			},
			{
				name: 'rowGap',
				type: 'ResponsiveValue<ZLayoutSpacing>',
				default: '—',
				description: '独立覆盖行间距。'
			},
			{
				name: 'columnGap',
				type: 'ResponsiveValue<ZLayoutSpacing>',
				default: '—',
				description: '独立覆盖列间距。'
			},
			{
				name: 'align',
				type: 'ResponsiveValue<ZLayoutAlignment>',
				default: "'stretch'",
				description: '栅格项的块轴对齐。'
			},
			{
				name: 'query',
				type: 'ResponsiveQuery',
				default: "'viewport'",
				description: 'viewport或命名祖先容器；子ZGridItem继承同一查询。'
			},
			{
				name: 'ref',
				type: 'HTMLDivElement | null',
				default: 'null',
				bindable: true,
				description: '真实栅格div引用。'
			}
		]
	} as const satisfies ZuiComponentMetadata;

	const gridRecipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.boxSizing.borderBox;
			s.minWidth.px(0);
			s._selector('& > *', (s) => s.minWidth.px(0));
		},
		variants: {}
	});
	registerRecipeHmr(import.meta, gridRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { useZui } from '../../runtime/foundation/context.js';
	import { applyResponsiveStyles } from '../../runtime/foundation/responsive.js';
	import { applyLayoutSpacing, applyLayoutAlignment } from '../../runtime/foundation/layout.js';
	import { assertGridInteger, provideGrid } from '../../runtime/foundation/grid-context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';

	let {
		children,
		class: className,
		dir,
		columns = 12,
		gap = 'medium',
		rowGap,
		columnGap,
		align = 'stretch',
		query = 'viewport',
		ref = $bindable(null),
		style,
		...rest
	}: ZGridProps = $props();
	const zui = useZui();
	const resolvedDirection = $derived(dir ?? zui.direction);
	provideGrid(() => ({ columns, query }));
	const rootClass = $derived(zui.recipe(gridRecipe));
	const layoutClass = $derived(
		zui.icss((s) => {
			s.gridTemplateColumns.raw('repeat(12, minmax(0, 1fr))');
			s.gap._medium;
			s.alignItems.stretch;
			applyResponsiveStyles(
				s,
				columns,
				(s, value) => {
					assertGridInteger(value, 'Grid columns');
					s.gridTemplateColumns.raw(`repeat(${value}, minmax(0, 1fr))`);
				},
				query
			);
			applyResponsiveStyles(s, gap, (s, value) => applyLayoutSpacing(s, 'gap', value), query);
			applyResponsiveStyles(s, rowGap, (s, value) => applyLayoutSpacing(s, 'rowGap', value), query);
			applyResponsiveStyles(
				s,
				columnGap,
				(s, value) => applyLayoutSpacing(s, 'columnGap', value),
				query
			);
			applyResponsiveStyles(s, align, applyLayoutAlignment, query);
		})
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, layoutClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	dir={resolvedDirection}
>
	{@render children?.()}
</div>
