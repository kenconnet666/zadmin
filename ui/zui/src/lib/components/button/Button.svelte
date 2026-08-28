<script lang="ts">
	import { untrack } from 'svelte';

	import { useZui } from '../provider/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../provider/variables.js';
	import { buttonRecipe } from './button.recipe.js';
	import type { ButtonProps } from './types.js';

	let {
		__icssVariables,
		children,
		class: className,
		disabled = false,
		loading = false,
		ref = $bindable(null),
		size = 'medium',
		style,
		type = 'button',
		variant = 'primary',
		...rest
	}: ButtonProps = $props();

	const zui = useZui();
	const buttonClass = $derived(
		zui.recipe(buttonRecipe, {
			disabled: disabled || loading,
			size,
			variant
		})
	);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(__icssVariables)));
</script>

<button
	{...rest}
	bind:this={ref}
	class={[buttonClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: __icssVariables }}
	{type}
	disabled={disabled || loading}
	aria-busy={loading || undefined}
>
	{#if loading}<span aria-hidden="true">…</span>{/if}
	{@render children?.()}
</button>
