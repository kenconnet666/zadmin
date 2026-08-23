<script lang="ts">
	import { untrack } from 'svelte';

	import { icss } from '../../icss/runtime.js';
	import { useZuiTheme } from '../provider/context.js';
	import {
		applyIcssVariables,
		mergeStyles,
		serializeIcssVariables
	} from '../provider/variables.js';
	import type { TextProps } from './types.js';

	let {
		__icssVariables,
		as = 'span',
		children,
		class: className,
		color = 'text',
		ref = $bindable(null),
		size = 'medium',
		style,
		weight = 'normal',
		...rest
	}: TextProps = $props();

	const context = useZuiTheme();
	const colorValue = $derived(context.theme.color[color]);
	const sizeValue = $derived(context.theme.fontSize[size]);
	const weightValue = $derived(context.theme.fontWeight[weight]);
	const textClass = $derived(
		icss(context.theme, (css) => {
			css.color(colorValue);
			if (typeof sizeValue === 'number') css.fontSize.px(sizeValue);
			else css.fontSize(sizeValue);
			css.fontWeight(weightValue);
		})
	);
	const initialVariables = untrack(() => serializeIcssVariables(__icssVariables));
	const rootStyle = $derived(mergeStyles(style, initialVariables));
</script>

<svelte:element
	this={as}
	{...rest}
	bind:this={ref}
	class={[textClass, className]}
	style={rootStyle}
	use:applyIcssVariables={__icssVariables}
>
	{@render children?.()}
</svelte:element>
