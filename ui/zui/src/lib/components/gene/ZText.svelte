<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { ZuiTheme } from '../../theme/types.js';

	export type ZTextElement = 'label' | 'p' | 'small' | 'span' | 'strong';
	export type ZTextTone = 'danger' | 'default' | 'muted' | 'primary';

	export interface ZTextProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		readonly as?: ZTextElement;
		readonly children?: Snippet;
		readonly size?: keyof ZuiTheme['fontSize'];
		readonly tone?: ZTextTone;
		readonly truncate?: boolean;
		readonly weight?: keyof ZuiTheme['fontWeight'];
		ref?: HTMLElement | null;
	}

	const textRecipe = defineRecipe({
		variants: {
			size: {
				large: (s) => s.fontSize._large,
				medium: (s) => s.fontSize._medium,
				small: (s) => s.fontSize._small,
				xlarge: (s) => s.fontSize._xlarge
			},
			tone: {
				danger: (s) => s.color._danger,
				default: (s) => s.color._text,
				muted: (s) => s.color._textMuted,
				primary: (s) => s.color._primary
			},
			truncate: {
				false: () => undefined,
				true: (s) => {
					s.overflow.hidden;
					s.textOverflow.ellipsis;
					s.whiteSpace.nowrap;
				}
			},
			weight: {
				bold: (s) => s.fontWeight._bold,
				medium: (s) => s.fontWeight._medium,
				normal: (s) => s.fontWeight._normal,
				semibold: (s) => s.fontWeight._semibold
			}
		},
		defaultVariants: {
			size: 'medium',
			tone: 'default',
			truncate: false,
			weight: 'normal'
		}
	});

	registerRecipeHmr(import.meta, textRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../component-runtime/root-style.js';
	import { useZui } from '../../component-runtime/zui-context.js';
	import { readIcssCarrier } from '../../runtime/internal.js';

	let {
		as = 'span',
		children,
		class: className,
		ref = $bindable(null),
		size = 'medium',
		style,
		tone = 'default',
		truncate = false,
		weight = 'normal',
		...rest
	}: ZTextProps = $props();

	const zui = useZui();
	const rootClass = $derived(zui.recipe(textRecipe, { size, tone, truncate, weight }));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<svelte:element
	this={as}
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
>
	{@render children?.()}
</svelte:element>
