<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { ZLayoutSpacing } from '../../runtime/foundation/layout.js';
	import type { ResponsiveQuery, ResponsiveValue } from '../../runtime/foundation/responsive.js';

	export type ZStackDirection = 'column' | 'column-reverse' | 'row' | 'row-reverse';
	export type ZStackAlignment = 'baseline' | 'center' | 'end' | 'start' | 'stretch';
	export type ZStackJustification = 'around' | 'between' | 'center' | 'end' | 'evenly' | 'start';

	export interface ZStackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly align?: ResponsiveValue<ZStackAlignment>;
		readonly children?: Snippet;
		readonly direction?: ResponsiveValue<ZStackDirection>;
		readonly gap?: ResponsiveValue<ZLayoutSpacing>;
		readonly rowGap?: ResponsiveValue<ZLayoutSpacing>;
		readonly columnGap?: ResponsiveValue<ZLayoutSpacing>;
		readonly query?: ResponsiveQuery;
		readonly justify?: ResponsiveValue<ZStackJustification>;
		readonly wrap?: ResponsiveValue<boolean | 'reverse'>;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		category: 'layout',
		id: 'stack',
		importStatement: "import { ZStack } from '@zadmin/zui';",
		name: 'ZStack',
		bindings: [
			{ description: '真实div布局根元素引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				default: "'column'",
				description: 'Flex主轴方向。',
				name: 'direction',
				type: 'ResponsiveValue<ZStackDirection>'
			},
			{
				default: "'none'",
				description: 'Theme间距token或明确px值。',
				name: 'gap',
				type: 'ResponsiveValue<ZLayoutSpacing>'
			},
			{
				default: "'stretch'",
				description: '交叉轴对齐。',
				name: 'align',
				type: 'ResponsiveValue<ZStackAlignment>'
			},
			{
				default: "'start'",
				description: '主轴分布。',
				name: 'justify',
				type: 'ResponsiveValue<ZStackJustification>'
			},
			{
				default: 'false',
				description: '换行；reverse反向排列换行后的行，支持断点配置。',
				name: 'wrap',
				type: "ResponsiveValue<boolean | 'reverse'>"
			},
			{
				default: '—',
				description: '行间距，独立覆盖gap，支持断点配置。',
				name: 'rowGap',
				type: 'ResponsiveValue<ZLayoutSpacing>'
			},
			{
				default: '—',
				description: '列间距，独立覆盖gap，支持断点配置。',
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
				description: '真实div引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: '0.1.0',
		snippets: [{ description: '布局内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/layout/ZStack.svelte',
		states: [],
		status: 'stable',
		summary: '类型安全的Flex布局容器，支持方向、间距、对齐、分布和换行。'
	} as const satisfies ZuiComponentMetadata;

	const stackRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.boxSizing.borderBox;
			s.minWidth.px(0);
		},
		variants: {}
	});

	registerRecipeHmr(import.meta, stackRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { applyResponsiveStyles } from '../../runtime/foundation/responsive.js';
	import {
		applyLayoutSpacing,
		applyLayoutAlignment,
		applyLayoutJustification
	} from '../../runtime/foundation/layout.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';

	let {
		align = 'stretch',
		children,
		class: className,
		dir,
		direction = 'column',
		gap = 'none',
		rowGap,
		columnGap,
		query = 'viewport',
		justify = 'start',
		ref = $bindable(null),
		style,
		wrap = false,
		...rest
	}: ZStackProps = $props();

	const zui = useZui();
	const recipeClass = $derived(zui.recipe(stackRecipe));
	const layoutClass = $derived(
		zui.icss((s) => {
			s.flexDirection.column;
			s.alignItems.stretch;
			s.justifyContent.start;
			s.flexWrap.nowrap;
			s.gap._none;
			applyResponsiveStyles(
				s,
				direction,
				(s, value) => {
					switch (value) {
						case 'column':
							s.flexDirection.column;
							break;
						case 'column-reverse':
							s.flexDirection.columnReverse;
							break;
						case 'row':
							s.flexDirection.row;
							break;
						case 'row-reverse':
							s.flexDirection.rowReverse;
							break;
						default:
							throw new TypeError('Invalid Stack direction.');
					}
				},
				query
			);
			applyResponsiveStyles(s, align, applyLayoutAlignment, query);
			applyResponsiveStyles(s, justify, applyLayoutJustification, query);
			applyResponsiveStyles(
				s,
				wrap,
				(s, value) => {
					if (value === 'reverse') s.flexWrap.wrapReverse;
					else if (value === true) s.flexWrap.wrap;
					else if (value === false) s.flexWrap.nowrap;
					else throw new TypeError('Invalid Stack wrap.');
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
		})
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[recipeClass, layoutClass, className]}
	dir={dir ?? zui.direction}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
>
	{@render children?.()}
</div>
