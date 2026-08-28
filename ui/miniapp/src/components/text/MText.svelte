<script lang="ts">
	import { mergeMiniStyles } from '../../styles/index.ts';
	import { useMiniappTheme } from '../../theme/index.ts';
	import type { MTextProps } from './types.ts';

	let {
		children,
		class: className,
		decode,
		id,
		selectable,
		size = 'medium',
		space,
		style,
		tone = 'default',
		userSelect,
		weight = 'normal'
	}: MTextProps = $props();
	const context = useMiniappTheme();
	const colorToken = $derived(
		({ danger: 'danger', default: 'text', muted: 'textMuted', primary: 'primary' } as const)[tone]
	);
	const mergedStyle = $derived(
		mergeMiniStyles(style, {
			color: context.theme.color[colorToken],
			fontSize: context.theme.fontSize[size],
			fontWeight: context.theme.fontWeight[weight]
		})
	);
	const nativeAttributes = $derived({ decode, selectable, space, 'user-select': userSelect });
</script>

<text {...nativeAttributes} {id} class={['m-text', className]} style={mergedStyle}>
	{@render children?.()}
</text>
