<script lang="ts">
	import { mergeTaroStyles } from '../runtime/index.ts';
	import type { BoxProps } from './types.ts';

	let { ariaLabel, children, class: className, hidden, hoverClass, id, style }: BoxProps = $props();
	const mergedStyle = $derived(mergeTaroStyles(style));
	const nativeAttributes = $derived({
		'aria-label': ariaLabel,
		hidden: hidden || undefined,
		'hover-class': hoverClass
	});
</script>

<view {...nativeAttributes} {id} class={['zui-box', className]} style={mergedStyle}>
	{@render children?.()}
</view>

<style>
	.zui-box {
		box-sizing: border-box;
	}
</style>
