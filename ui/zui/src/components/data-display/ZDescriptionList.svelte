<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export interface DescriptionItem {
		readonly description: string;
		readonly id: number | string;
		readonly term: string;
	}
	export interface ZDescriptionListProps extends HTMLAttributes<HTMLDListElement> {
		readonly items: readonly DescriptionItem[];
		ref?: HTMLDListElement | null;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'description-list',
		importStatement: "import { ZDescriptionList } from '@zadmin/zui';",
		name: 'ZDescriptionList',
		bindings: [{ description: '真实dl引用。', name: 'ref', type: 'HTMLDListElement | null' }],
		dependencies: [],
		events: [],
		keyboard: [],
		parts: [
			{ description: 'dt。', name: 'term' },
			{ description: 'dd。', name: 'description' }
		],
		props: [
			{
				default: '必填',
				description: '稳定id与term/description。',
				name: 'items',
				required: true,
				type: 'readonly DescriptionItem[]'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/data-display/ZDescriptionList.svelte',
		states: [],
		status: 'experimental',
		summary: '原生dl/dt/dd语义的Description List。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._medium;
			s.margin.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	const termRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.fontSize._small;
		},
		variants: {},
		defaultVariants: {}
	});
	const descriptionRecipe = defineRecipe({
		base: (s) => {
			s.marginInlineStart.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	registerRecipeHmr(import.meta, termRecipe);
	registerRecipeHmr(import.meta, descriptionRecipe);
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
		class: className,
		items,
		ref = $bindable(null),
		style,
		...rest
	}: ZDescriptionListProps = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(recipe));
	const termClass = $derived(zui.recipe(termRecipe));
	const descriptionClass = $derived(zui.recipe(descriptionRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<dl
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
>
	{#each items as item (item.id)}<div>
			<dt class={termClass}>{item.term}</dt>
			<dd class={descriptionClass}>{item.description}</dd>
		</div>{/each}
</dl>
