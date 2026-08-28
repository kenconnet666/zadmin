<script lang="ts">
	import { untrack } from 'svelte';

	import { readIcssCarrier } from '../../runtime/internal.js';
	import { useZui } from '../provider/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../provider/variables.js';
	import { textRecipe } from './text.recipe.js';
	import type { ZTextProps } from './types.js';

	let {
		as = 'span',
		children,
		class: className,
		ref = $bindable(null),
		size = 'medium',
		style,
		tone = 'default',
		truncate = false,
		weight = 'normal',
		...rest
	}: ZTextProps = $props();

	const zui = useZui();
	const rootClass = $derived(zui.recipe(textRecipe, { size, tone, truncate, weight }));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<svelte:element
	this={as}
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
>
	{@render children?.()}
</svelte:element>
