<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export interface ZCardProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		readonly children?: Snippet;
		readonly footer?: Snippet;
		readonly header?: Snippet;
		ref?: HTMLElement | null;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'card',
		importStatement: "import { ZCard } from '@zadmin/zui';",
		name: 'ZCard',
		bindings: [{ description: '真实article引用。', name: 'ref', type: 'HTMLElement | null' }],
		dependencies: [],
		events: [],
		keyboard: [],
		parts: [
			{ description: 'header。', name: 'header' },
			{ description: 'body。', name: 'body' },
			{ description: 'footer。', name: 'footer' }
		],
		props: [],
		since: 'unreleased',
		snippets: [
			{ description: 'Card正文。', name: 'children', type: 'Snippet' },
			{ description: 'Header。', name: 'header', type: 'Snippet' },
			{ description: 'Footer。', name: 'footer', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/data-display/ZCard.svelte',
		states: [],
		status: 'experimental',
		summary: '使用article与header/footer真实语义的Card。'
	} as const satisfies ZuiComponentMetadata;
	const rootRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._large;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.boxShadow._small;
			s.overflow.hidden;
		},
		variants: {},
		defaultVariants: {}
	});
	const sectionRecipe = defineRecipe({
		base: (s) => s.padding._large,
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, sectionRecipe);
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
		footer,
		header,
		ref = $bindable(null),
		style,
		...rest
	}: ZCardProps = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(rootRecipe));
	const sectionClass = $derived(zui.recipe(sectionRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<article
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
>
	{#if header}<header class={sectionClass} data-slot="header">{@render header()}</header>{/if}
	<div class={sectionClass} data-slot="body">{@render children?.()}</div>
	{#if footer}<footer class={sectionClass} data-slot="footer">{@render footer()}</footer>{/if}
</article>
