<script lang="ts">
	import { untrack } from 'svelte';

	import { readIcssCarrier } from '../../runtime/internal.js';
	import { useZui } from '../provider/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../provider/variables.js';
	import { iconRecipe } from './icon.recipe.js';
	import { iconManifest } from './manifest.js';
	import type { ZIconProps } from './types.js';

	let {
		class: className,
		label,
		name,
		ref = $bindable(null),
		size = 'small',
		style,
		...rest
	}: ZIconProps = $props();

	const zui = useZui();
	const recipeClass = $derived(
		zui.recipe(iconRecipe, { size: typeof size === 'number' ? 'small' : size })
	);
	const numericSizeClass = $derived(
		typeof size === 'number'
			? zui.icss((s) => {
					s.width.px(size);
					s.height.px(size);
				})
			: undefined
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<svg
	{...rest}
	bind:this={ref}
	class={[recipeClass, numericSizeClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	viewBox="0 0 24 24"
	fill="currentColor"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	focusable="false"
>
	{#each iconManifest[name] as path (path)}
		<path d={path}></path>
	{/each}
</svg>
