<script lang="ts">
	import { untrack } from 'svelte';

	import { icss } from '../../icss/runtime.js';
	import { useZuiTheme } from '../provider/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../provider/variables.js';
	import type { StackProps } from './types.js';

	let {
		__icssVariables,
		align = 'stretch',
		children,
		class: className,
		direction = 'column',
		gap = 'medium',
		justify = 'start',
		ref = $bindable(null),
		style,
		...rest
	}: StackProps = $props();

	const context = useZuiTheme();
	const gapValue = $derived(typeof gap === 'number' ? gap : context.theme.space[gap]);
	const stackClass = $derived(
		icss(context.theme, (css) => {
			css.display.flex;
			css.flexDirection(direction);
			css.alignItems(align);
			css.justifyContent(justify);
			if (typeof gapValue === 'number') css.gap.px(gapValue);
			else css.gap(gapValue);
		})
	);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(__icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[stackClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: __icssVariables }}
>
	{@render children?.()}
</div>
