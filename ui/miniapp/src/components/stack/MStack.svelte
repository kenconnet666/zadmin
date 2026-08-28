<script lang="ts">
	import { mergeMiniStyles, rpx } from '../../styles/index.ts';
	import { useMiniappTheme } from '../../theme/index.ts';
	import type { MStackProps } from './types.ts';

	let {
		align = 'stretch',
		children,
		class: className,
		direction = 'column',
		gap = 'none',
		id,
		justify = 'start',
		style,
		wrap = false
	}: MStackProps = $props();
	const context = useMiniappTheme();
	const justifyContent = $derived(
		({ around: 'space-around', between: 'space-between', evenly: 'space-evenly' } as const)[
			justify as 'around' | 'between' | 'evenly'
		] ?? justify
	);
	const mergedStyle = $derived(
		mergeMiniStyles(style, {
			alignItems: align,
			flexDirection: direction,
			flexWrap: wrap ? 'wrap' : 'nowrap',
			gap: typeof gap === 'number' ? rpx(gap) : context.theme.space[gap],
			justifyContent
		})
	);
</script>

<view {id} class={['m-stack', className]} style={mergedStyle}>
	{@render children?.()}
</view>

<style>
	.m-stack {
		display: flex;
		box-sizing: border-box;
	}
</style>
