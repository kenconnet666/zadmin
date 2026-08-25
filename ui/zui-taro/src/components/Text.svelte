<script lang="ts">
	import { mergeTaroStyles, useZuiTaroTheme } from '../runtime/index.ts';
	import type { TextProps } from './types.ts';

	let {
		children,
		class: className,
		color = 'text',
		decode,
		id,
		selectable,
		size = 'medium',
		space,
		style,
		userSelect,
		weight = 'normal'
	}: TextProps = $props();
	const context = useZuiTaroTheme();
	const mergedStyle = $derived(
		mergeTaroStyles(style, {
			color: context.theme.color[color],
			fontSize: `${context.theme.fontSize[size]}px`,
			fontWeight: context.theme.fontWeight[weight]
		})
	);
	const nativeAttributes = $derived({ decode, selectable, space, 'user-select': userSelect });
</script>

<text {...nativeAttributes} {id} class={['zui-text', className]} style={mergedStyle}>
	{@render children?.()}
</text>
