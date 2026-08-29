<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../component-metadata.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { ZuiTheme } from '../../theme/types.js';

	export type ZStackDirection = 'column' | 'column-reverse' | 'row' | 'row-reverse';
	export type ZStackAlignment = 'baseline' | 'center' | 'end' | 'start' | 'stretch';
	export type ZStackJustification = 'around' | 'between' | 'center' | 'end' | 'evenly' | 'start';

	export interface ZStackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly align?: ZStackAlignment;
		readonly children?: Snippet;
		readonly direction?: ZStackDirection;
		readonly gap?: keyof ZuiTheme['space'] | number;
		readonly justify?: ZStackJustification;
		readonly wrap?: boolean;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		category: 'layout',
		id: 'stack',
		importStatement: "import { ZStack } from '@zadmin/zui';",
		name: 'ZStack',
		props: [
			{
				default: "'column'",
				description: 'Flex主轴方向。',
				name: 'direction',
				type: "'row' | 'row-reverse' | 'column' | 'column-reverse'"
			},
			{
				default: "'none'",
				description: 'Theme间距token或明确px值。',
				name: 'gap',
				type: "keyof ZuiTheme['space'] | number"
			},
			{
				default: "'stretch'",
				description: '交叉轴对齐。',
				name: 'align',
				type: "'start' | 'center' | 'end' | 'baseline' | 'stretch'"
			},
			{
				default: "'start'",
				description: '主轴分布。',
				name: 'justify',
				type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'"
			},
			{ default: 'false', description: '是否允许Flex换行。', name: 'wrap', type: 'boolean' },
			{
				bindable: true,
				default: 'null',
				description: '真实div引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		source: 'ui/zui/src/lib/components/layout/ZStack.svelte',
		status: 'stable',
		summary: '类型安全的Flex布局容器，支持方向、间距、对齐、分布和换行。'
	} as const satisfies ZuiComponentMetadata;

	const stackRecipe = defineRecipe({
		base: (s) => s.display.flex,
		variants: {
			align: {
				baseline: (s) => s.alignItems.baseline,
				center: (s) => s.alignItems.center,
				end: (s) => s.alignItems.end,
				start: (s) => s.alignItems.start,
				stretch: (s) => s.alignItems.stretch
			},
			direction: {
				column: (s) => s.flexDirection.column,
				'column-reverse': (s) => s.flexDirection.columnReverse,
				row: (s) => s.flexDirection.row,
				'row-reverse': (s) => s.flexDirection.rowReverse
			},
			gap: {
				custom: () => undefined,
				large: (s) => s.gap._large,
				medium: (s) => s.gap._medium,
				none: (s) => s.gap._none,
				small: (s) => s.gap._small,
				xlarge: (s) => s.gap._xlarge,
				xsmall: (s) => s.gap._xsmall
			},
			justify: {
				around: (s) => s.justifyContent.spaceAround,
				between: (s) => s.justifyContent.spaceBetween,
				center: (s) => s.justifyContent.center,
				end: (s) => s.justifyContent.end,
				evenly: (s) => s.justifyContent.spaceEvenly,
				start: (s) => s.justifyContent.start
			},
			wrap: {
				false: (s) => s.flexWrap.nowrap,
				true: (s) => s.flexWrap.wrap
			}
		},
		defaultVariants: {
			align: 'stretch',
			direction: 'column',
			gap: 'none',
			justify: 'start',
			wrap: false
		}
	});

	registerRecipeHmr(import.meta, stackRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../component-runtime/root-style.js';
	import { useZui } from '../../component-runtime/zui-context.js';
	import { readIcssCarrier } from '../../runtime/internal.js';

	let {
		align = 'stretch',
		children,
		class: className,
		direction = 'column',
		gap = 'none',
		justify = 'start',
		ref = $bindable(null),
		style,
		wrap = false,
		...rest
	}: ZStackProps = $props();

	const zui = useZui();
	const recipeClass = $derived(
		zui.recipe(stackRecipe, {
			align,
			direction,
			gap: typeof gap === 'number' ? 'custom' : gap,
			justify,
			wrap
		})
	);
	const numericGapClass = $derived(
		typeof gap === 'number'
			? zui.icss((s) => {
					s.gap.px(gap);
				})
			: undefined
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[recipeClass, numericGapClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
>
	{@render children?.()}
</div>
