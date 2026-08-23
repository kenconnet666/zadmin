<script lang="ts">
	import { untrack } from 'svelte';

	import {
		applyIcssRootStyle,
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
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(__icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={className}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: __icssVariables }}
>
	{@render children?.()}
</div>
