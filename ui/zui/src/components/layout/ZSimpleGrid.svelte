<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZLayoutSpacing } from '../../runtime/foundation/layout.js';
	import type { ResponsiveQuery, ResponsiveValue } from '../../runtime/foundation/responsive.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type ZSimpleGridMinItemWidth = number | string;

	export interface ZSimpleGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly children?: Snippet;
		readonly columnGap?: ResponsiveValue<ZLayoutSpacing>;
		readonly columns?: ResponsiveValue<number>;
		readonly gap?: ResponsiveValue<ZLayoutSpacing>;
		readonly minItemWidth?: ResponsiveValue<ZSimpleGridMinItemWidth>;
		readonly query?: ResponsiveQuery;
		readonly rowGap?: ResponsiveValue<ZLayoutSpacing>;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		bindings: [{ description: '真实网格div引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		category: 'layout',
		dependencies: ['CSS Grid', 'typed responsive CSS', 'named container queries'],
		events: [],
		id: 'simple-grid',
		importStatement: "import { ZSimpleGrid } from '@zadmin/zui';",
		keyboard: [],
		name: 'ZSimpleGrid',
		parts: [],
		props: [
			{
				default: '3',
				description: '每个断点的正整数等宽列数；minItemWidth存在时此值保留但不参与布局。',
				name: 'columns',
				type: 'ResponsiveValue<number>'
			},
			{
				default: '—',
				description:
					'每个断点的最小列宽，切换到CSS auto-fit并优先于columns；数字按px，支持CSS长度、百分比和var/calc/min/max/clamp；未给base时使用Theme.size.gridItemMinWidth。',
				name: 'minItemWidth',
				type: 'ResponsiveValue<number | string>'
			},
			{
				default: "'medium'",
				description: '双轴Theme间距或非负px值，支持断点配置。',
				name: 'gap',
				type: 'ResponsiveValue<ZLayoutSpacing>'
			},
			{
				default: '—',
				description: '独立覆盖行间距，支持断点配置。',
				name: 'rowGap',
				type: 'ResponsiveValue<ZLayoutSpacing>'
			},
			{
				default: '—',
				description: '独立覆盖列间距，支持断点配置。',
				name: 'columnGap',
				type: 'ResponsiveValue<ZLayoutSpacing>'
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
				description: '真实网格div引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '普通等宽网格子项；不使用ZGridItem或布局上下文。',
				name: 'children',
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/layout/ZSimpleGrid.svelte',
		states: [
			{
				description: '固定列数或自适应最小列宽策略。',
				name: 'data-mode',
				values: ['columns', 'min-item-width']
			}
		],
		status: 'experimental',
		summary:
			'用普通children提供固定等宽列或纯CSS auto-fit最小列宽，不承担ZGridItem跨列与布局上下文。'
	} as const satisfies ZuiComponentMetadata;

	const simpleGridRecipe = defineRecipe({
		base: (s) => {
			s.boxSizing.borderBox;
			s.display.grid;
			s.minWidth.px(0);
			s._selector('& > *', (s) => s.minWidth.px(0));
		},
		defaultVariants: {},
		variants: {}
	});

	registerRecipeHmr(import.meta, simpleGridRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { applyLayoutSpacing } from '../../runtime/foundation/layout.js';
	import { applyResponsiveStyles } from '../../runtime/foundation/responsive.js';
	import { cssLengthExpression } from '../../theme/units.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';

	let {
		children,
		class: className,
		dir,
		columnGap,
		columns,
		gap = 'medium',
		minItemWidth,
		query = 'viewport',
		ref = $bindable(null),
		rowGap,
		style,
		...rest
	}: ZSimpleGridProps = $props();

	function assertColumnCount(value: number): void {
		if (!Number.isSafeInteger(value) || value < 1) {
			throw new TypeError('SimpleGrid columns must be a positive safe integer.');
		}
	}

	const zui = useZui();
	const resolvedDirection = $derived(dir ?? zui.direction);
	const rootClass = $derived(zui.recipe(simpleGridRecipe));
	const resolvedColumns = $derived(columns ?? 3);
	const mode = $derived(minItemWidth === undefined ? 'columns' : 'min-item-width');
	const layoutClass = $derived(
		zui.icss((s) => {
			s.gap._medium;
			if (minItemWidth === undefined) {
				s.gridTemplateColumns.raw('repeat(3, minmax(0, 1fr))');
				applyResponsiveStyles(
					s,
					resolvedColumns,
					(s, value) => {
						assertColumnCount(value);
						s.gridTemplateColumns.raw(`repeat(${value}, minmax(0, 1fr))`);
					},
					query
				);
			} else {
				s.gridTemplateColumns.raw(
					`repeat(auto-fit, minmax(min(100%, ${cssLengthExpression(zui.theme.size.gridItemMinWidth)}), 1fr))`
				);
				applyResponsiveStyles(
					s,
					minItemWidth,
					(s, value) => {
						const width = cssLengthExpression(value);
						s.gridTemplateColumns.raw(`repeat(auto-fit, minmax(min(100%, ${width}), 1fr))`);
					},
					query
				);
			}
			applyResponsiveStyles(s, gap, (s, value) => applyLayoutSpacing(s, 'gap', value), query);
			applyResponsiveStyles(s, rowGap, (s, value) => applyLayoutSpacing(s, 'rowGap', value), query);
			applyResponsiveStyles(
				s,
				columnGap,
				(s, value) => applyLayoutSpacing(s, 'columnGap', value),
				query
			);
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
	data-mode={mode}
>
	{@render children?.()}
</div>
