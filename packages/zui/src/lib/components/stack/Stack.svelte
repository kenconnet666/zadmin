<script lang="ts">
	import { untrack } from 'svelte';

	import { icss } from '../../icss/runtime.js';
	import { useZuiTheme } from '../provider/context.js';
	import {
		applyIcssVariables,
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
	const initialVariables = untrack(() => serializeIcssVariables(__icssVariables));
	const rootStyle = $derived(mergeStyles(style, initialVariables));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[stackClass, className]}
	style={rootStyle}
	use:applyIcssVariables={__icssVariables}
>
	{@render children?.()}
</div>
