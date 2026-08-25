<script lang="ts">
	import { untrack } from 'svelte';

	import { icss } from '../../icss/runtime.js';
	import { useZuiTheme } from '../provider/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../provider/variables.js';
	import type { ButtonProps } from './types.js';

	let {
		__icssVariables,
		children,
		class: className,
		disabled = false,
		loading = false,
		ref = $bindable(null),
		size = 'medium',
		style,
		type = 'button',
		variant = 'primary',
		...rest
	}: ButtonProps = $props();

	const context = useZuiTheme();
	const palette = $derived.by(() => {
		const color = context.theme.color;
		switch (variant) {
			case 'danger':
				return {
					background: color.danger,
					border: color.danger,
					foreground: color.canvas,
					hover: color.danger
				};
			case 'ghost':
				return {
					background: 'transparent',
					border: 'transparent',
					foreground: color.primary,
					hover: color.surface
				};
			case 'secondary':
				return {
					background: color.surface,
					border: color.border,
					foreground: color.text,
					hover: color.canvas
				};
			default:
				return {
					background: color.primary,
					border: color.primary,
					foreground: color.canvas,
					hover: color.primaryHover
				};
		}
	});
	const metrics = $derived.by(() => {
		switch (size) {
			case 'large':
				return { font: 16, height: 44, horizontal: 20 };
			case 'small':
				return { font: 12, height: 28, horizontal: 10 };
			default:
				return { font: 14, height: 36, horizontal: 16 };
		}
	});
	const buttonClass = $derived(
		icss(context.theme, (css) => {
			css.display.inlineFlex;
			css.alignItems.center;
			css.justifyContent.center;
			css.gap.px(8);
			css.minHeight.px(metrics.height);
			css.padding.px(0, metrics.horizontal);
			css.borderWidth.px(1);
			css.borderStyle('solid');
			css.borderColor(palette.border);
			css.borderRadius._medium;
			css.backgroundColor(palette.background);
			css.color(palette.foreground);
			css.fontSize.px(metrics.font);
			css.fontWeight._semibold;
			css.lineHeight(1);
			css.cursor.pointer;
			css.transitionDuration._fast;
			css.transitionProperty('background-color, border-color, color, opacity');
			css.transitionTimingFunction('ease');
			css.userSelect.none;
			css._hover((hover) => hover.backgroundColor(palette.hover));
			css._focusVisible((focus) => {
				focus.outline('2px solid currentColor');
				focus.outlineOffset.px(2);
			});
			if (disabled || loading) {
				css.cursor.notAllowed;
				css.opacity._disabled;
			}
		})
	);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(__icssVariables)));
</script>

<button
	{...rest}
	bind:this={ref}
	class={[buttonClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: __icssVariables }}
	{type}
	disabled={disabled || loading}
	aria-busy={loading || undefined}
>
	{#if loading}<span aria-hidden="true">…</span>{/if}
	{@render children?.()}
</button>
