<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type BadgeTone = 'accent' | 'danger' | 'default' | 'success' | 'warning';
	export interface ZBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		readonly children?: Snippet;
		readonly tone?: BadgeTone;
		ref?: HTMLSpanElement | null;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'badge',
		importStatement: "import { ZBadge } from '@zadmin/zui';",
		name: 'ZBadge',
		bindings: [{ description: '真实span引用。', name: 'ref', type: 'HTMLSpanElement | null' }],
		dependencies: [],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				default: "'default'",
				description: '语义tone。',
				name: 'tone',
				type: "'default' | 'accent' | 'success' | 'warning' | 'danger'"
			}
		],
		since: '0.7.0',
		snippets: [{ description: '短状态文本。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/data-display/ZBadge.svelte',
		states: [],
		status: 'experimental',
		summary: '用于计数与短状态的紧凑文本Badge。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.borderRadius._large;
			s.display.inlineFlex;
			s.fontSize._small;
			s.fontWeight._semibold;
			s.paddingBlock._xsmall;
			s.paddingInline._medium;
		},
		variants: {
			tone: {
				accent: (s) => {
					s.backgroundColor._accent;
					s.color._canvas;
				},
				danger: (s) => {
					s.backgroundColor._danger;
					s.color._canvas;
				},
				default: (s) => {
					s.backgroundColor._surface;
					s.color._text;
				},
				success: (s) => {
					s.backgroundColor._success;
					s.color._canvas;
				},
				warning: (s) => {
					s.backgroundColor._warning;
					s.color._canvas;
				}
			}
		},
		defaultVariants: { tone: 'default' }
	});
	registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	let {
		children,
		class: className,
		ref = $bindable(null),
		style,
		tone = 'default',
		...rest
	}: ZBadgeProps = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(recipe, { tone }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<span
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}>{@render children?.()}</span
>
