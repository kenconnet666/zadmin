<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ResponsiveValue } from '../../runtime/foundation/responsive.js';
	import type { ZLayoutAlignment } from '../../runtime/foundation/layout.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export interface ZGridItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly children?: Snippet;
		readonly span?: ResponsiveValue<number | 'full'>;
		readonly start?: ResponsiveValue<number | 'auto'>;
		readonly rowSpan?: ResponsiveValue<number>;
		readonly order?: ResponsiveValue<number>;
		readonly align?: ResponsiveValue<ZLayoutAlignment | 'auto'>;
		ref?: HTMLDivElement | null;
	}
	export const zuiMetadata = {
		category: 'layout',
		id: 'grid-item',
		name: 'ZGridItem',
		status: 'experimental',
		since: 'unreleased',
		source: 'ui/zui/src/components/layout/ZGridItem.svelte',
		importStatement: "import { ZGridItem } from '@zadmin/zui';",
		summary: '栅格项的响应式跨列、起始列、跨行和视觉顺序，继承父栅格的查询参照。',
		dependencies: ['ZGrid'],
		events: [],
		keyboard: [],
		parts: [],
		states: [],
		bindings: [{ name: 'ref', type: 'HTMLDivElement | null', description: '真实栅格项div引用。' }],
		snippets: [{ name: 'children', type: 'Snippet', description: '栅格项内容。' }],
		props: [
			{
				name: 'span',
				type: "ResponsiveValue<number | 'full'>",
				default: '1',
				description: '正整数跨列数，超出父列数时收敛；full占满可用列。'
			},
			{
				name: 'start',
				type: "ResponsiveValue<number | 'auto'>",
				default: "'auto'",
				description: '从1开始的逻辑起始列；auto按DOM顺序自动放置，RTL由CSS处理。'
			},
			{
				name: 'rowSpan',
				type: 'ResponsiveValue<number>',
				default: '1',
				description: '正整数跨行数。'
			},
			{
				name: 'order',
				type: 'ResponsiveValue<number>',
				default: '0',
				description: '整数视觉顺序，不改变DOM和Tab阅读顺序。'
			},
			{
				name: 'align',
				type: "ResponsiveValue<ZLayoutAlignment | 'auto'>",
				default: "'auto'",
				description: '块轴自对齐；auto继承父栅格。'
			},
			{
				name: 'ref',
				type: 'HTMLDivElement | null',
				default: 'null',
				bindable: true,
				description: '真实栅格项div引用。'
			}
		]
	} as const satisfies ZuiComponentMetadata;
	const gridItemRecipe = defineRecipe({
		base: (s) => {
			s.minWidth.px(0);
			s.boxSizing.borderBox;
		},
		variants: {}
	});
	registerRecipeHmr(import.meta, gridItemRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { useZui } from '../../runtime/foundation/context.js';
	import {
		applyResponsiveStyles,
		responsiveBreakpoints,
		resolveResponsiveValue
	} from '../../runtime/foundation/responsive.js';
	import { assertGridInteger, useGrid } from '../../runtime/foundation/grid-context.js';
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
		span = 1,
		start = 'auto',
		rowSpan = 1,
		order = 0,
		align = 'auto',
		ref = $bindable(null),
		style,
		...rest
	}: ZGridItemProps = $props();
	const zui = useZui();
	const resolvedDirection = $derived(dir ?? zui.direction);
	const grid = useGrid();
	const rootClass = $derived(zui.recipe(gridItemRecipe));
	const layoutClass = $derived(
		zui.icss((s) => {
			// Validate every provided step, even when a larger parent step will clamp it.
			applyResponsiveStyles(
				s,
				span,
				(s, value) => {
					void s;
					if (value !== 'full') assertGridInteger(value, 'Grid span');
				},
				grid.query
			);
			applyResponsiveStyles(
				s,
				start,
				(s, value) => {
					void s;
					if (value !== 'auto') assertGridInteger(value, 'Grid start');
				},
				grid.query
			);
			const placement: { base?: string; small?: string; medium?: string; large?: string } = {};
			for (const breakpoint of ['base', ...responsiveBreakpoints] as const) {
				const count = resolveResponsiveValue(grid.columns, breakpoint, 12);
				assertGridInteger(count, 'Grid columns');
				const requestedSpan = resolveResponsiveValue<number | 'full'>(span, breakpoint, 1);
				const requestedStart = resolveResponsiveValue<number | 'auto'>(start, breakpoint, 'auto');
				const first = requestedStart === 'auto' ? 'auto' : Math.min(requestedStart, count);
				const available = first === 'auto' ? count : count - first + 1;
				const width = requestedSpan === 'full' ? available : Math.min(requestedSpan, available);
				placement[breakpoint] = `${first} / span ${width}`;
			}
			applyResponsiveStyles(s, placement, (s, value) => s.gridColumn.raw(value), grid.query);
			s.gridRow.raw('auto / span 1');
			s.order(0);
			s.alignSelf.auto;
			applyResponsiveStyles(
				s,
				rowSpan,
				(s, value) => {
					assertGridInteger(value, 'Grid rowSpan');
					s.gridRow.raw(`auto / span ${value}`);
				},
				grid.query
			);
			applyResponsiveStyles(
				s,
				order,
				(s, value) => {
					if (!Number.isSafeInteger(value))
						throw new TypeError('Grid order must be a safe integer.');
					s.order(value);
				},
				grid.query
			);
			applyResponsiveStyles(
				s,
				align,
				(s, value) => {
					if (!['auto', 'baseline', 'center', 'end', 'start', 'stretch'].includes(value))
						throw new TypeError('Invalid GridItem alignment.');
					s.alignSelf[value];
				},
				grid.query
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
>
	{@render children?.()}
</div>
