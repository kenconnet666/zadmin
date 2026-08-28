<script lang="ts">
	import { untrack } from 'svelte';

	import { readIcssCarrier } from '../../runtime/internal.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../provider/variables.js';
	import type { ZBoxProps } from './types.js';

	let { children, class: className, ref = $bindable(null), style, ...rest }: ZBoxProps = $props();
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={className}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
>
	{@render children?.()}
</div>
