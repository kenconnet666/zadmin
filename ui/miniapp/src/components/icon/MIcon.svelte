<script lang="ts">
	import { mergeMiniStyles, rpx } from '../../styles/index.ts';
	import { useMiniappTheme } from '../../theme/index.ts';
	import { miniIconManifest, type MIconProps } from './types.ts';

	let {
		class: className,
		color = 'text',
		id,
		label,
		name,
		size = 'medium',
		style
	}: MIconProps = $props();
	const context = useMiniappTheme();
	const mergedStyle = $derived(
		mergeMiniStyles(style, {
			color: context.theme.color[color],
			fontSize: typeof size === 'number' ? rpx(size) : context.theme.fontSize[size],
			lineHeight: 1
		})
	);
</script>

<text
	{id}
	class={['m-icon', className]}
	style={mergedStyle}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}>{miniIconManifest[name]}</text
>
