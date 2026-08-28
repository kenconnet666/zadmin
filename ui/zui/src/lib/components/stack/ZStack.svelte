<script lang="ts">
	import { untrack } from 'svelte';

	import { readIcssCarrier } from '../../runtime/internal.js';
	import { useZui } from '../provider/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../provider/variables.js';
	import { stackRecipe } from './stack.recipe.js';
	import type { ZStackProps } from './types.js';

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
