<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { DefaultTheme } from '../../theme/default.js';
	import type { ZuiTheme } from '../../theme/types.js';

	export type StackGap = keyof DefaultTheme['space'] | number;
	export type StackDirection = 'column' | 'column-reverse' | 'row' | 'row-reverse';
	export type StackAlignment = 'baseline' | 'center' | 'end' | 'start' | 'stretch';
	export type StackJustification =
		'center' | 'end' | 'space-around' | 'space-between' | 'space-evenly' | 'start';

	export interface StackDesignProps {
		align?: StackAlignment;
		direction?: StackDirection;
		gap?: StackGap;
		justify?: StackJustification;
	}

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
			gap: typeof gap === 'number' ? 'none' : gap,
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
