<script lang="ts">
	import { mergeMiniStyles } from '../../styles/index.ts';
	import type { MBoxProps } from './types.ts';

	let {
		ariaLabel,
		children,
		class: className,
		hidden,
		hoverClass,
		id,
		style
	}: MBoxProps = $props();
	const mergedStyle = $derived(mergeMiniStyles(style));
	const nativeAttributes = $derived({
		'aria-label': ariaLabel,
		hidden: hidden || undefined,
		'hover-class': hoverClass
	});
</script>

<view {...nativeAttributes} {id} class={['m-box', className]} style={mergedStyle}>
	{@render children?.()}
</view>

<style>
	.m-box {
		box-sizing: border-box;
	}
</style>
