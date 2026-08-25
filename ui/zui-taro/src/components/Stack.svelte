<script lang="ts">
	import { mergeTaroStyles, useZuiTaroTheme } from '../runtime/index.ts';
	import type { StackProps } from './types.ts';

	let {
		align = 'stretch',
		children,
		class: className,
		direction = 'column',
		gap = 'medium',
		id,
		justify = 'start',
		style
	}: StackProps = $props();
	const context = useZuiTaroTheme();
	const gapValue = $derived(typeof gap === 'number' ? gap : context.theme.space[gap]);
	const mergedStyle = $derived(
		mergeTaroStyles(style, {
			alignItems: align,
			flexDirection: direction,
			gap: typeof gapValue === 'number' ? `${gapValue}px` : gapValue,
			justifyContent: justify
		})
	);
</script>

<view {id} class={['zui-stack', className]} style={mergedStyle}>
	{@render children?.()}
</view>

<style>
	.zui-stack {
		display: flex;
		box-sizing: border-box;
	}
</style>
