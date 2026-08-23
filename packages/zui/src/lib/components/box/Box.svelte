<script lang="ts">
	import { untrack } from 'svelte';

	import {
		applyIcssVariables,
		mergeStyles,
		serializeIcssVariables
	} from '../provider/variables.js';
	import type { BoxProps } from './types.js';

	let {
		__icssVariables,
		children,
		class: className,
		ref = $bindable(null),
		style,
		...rest
	}: BoxProps = $props();
	const initialVariables = untrack(() => serializeIcssVariables(__icssVariables));
	const rootStyle = $derived(mergeStyles(style, initialVariables));
</script>

<div
	{...rest}
	bind:this={ref}
	class={className}
	style={rootStyle}
	use:applyIcssVariables={__icssVariables}
>
	{@render children?.()}
</div>
