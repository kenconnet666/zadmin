<script lang="ts">
	import { untrack } from 'svelte';

	import { readIcssCarrier } from '../../runtime/internal.js';
	import { useZui } from '../provider/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../provider/variables.js';
	import { buttonRecipe } from './button.recipe.js';
	import type { ZButtonProps } from './types.js';

	let {
		children,
		class: className,
		disabled = false,
		fullWidth = false,
		loading = false,
		ref = $bindable(null),
		size = 'medium',
		style,
		type = 'button',
		variant = 'primary',
		...rest
	}: ZButtonProps = $props();

	const zui = useZui();
	const rootClass = $derived(
		zui.recipe(buttonRecipe, {
			disabled: disabled || loading,
			fullWidth,
			size,
			variant
		})
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<button
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	{type}
	disabled={disabled || loading}
	aria-busy={loading || undefined}
	data-loading={loading || undefined}
>
	{#if loading}<span aria-hidden="true">…</span>{/if}
	{@render children?.()}
</button>
