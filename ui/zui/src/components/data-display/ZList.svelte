<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes, HTMLOlAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export interface ListItem {
		readonly description?: string;
		readonly id: number | string;
		readonly label: string;
	}
	export interface ZListProps extends Omit<
		HTMLAttributes<HTMLUListElement> & HTMLOlAttributes,
		'children'
	> {
		readonly item?: Snippet<[ListItem]>;
		readonly items: readonly ListItem[];
		readonly ordered?: boolean;
		ref?: HTMLOListElement | HTMLUListElement | null;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'list',
		importStatement: "import { ZList } from '@zadmin/zui';",
		name: 'ZList',
		bindings: [
			{
				description: '真实ol/ul引用。',
				name: 'ref',
				type: 'HTMLOListElement | HTMLUListElement | null'
			}
		],
		dependencies: ['stable item ids'],
		events: [],
		keyboard: [],
		parts: [{ description: 'li。', name: 'item' }],
		props: [
			{
				default: '必填',
				description: '稳定id、标签和说明。',
				name: 'items',
				required: true,
				type: 'readonly ListItem[]'
			},
			{ default: 'false', description: '使用ol。', name: 'ordered', type: 'boolean' }
		],
		since: '0.7.0',
		snippets: [{ description: '自定义li内容。', name: 'item', type: 'Snippet<[ListItem]>' }],
		source: 'ui/zui/src/components/data-display/ZList.svelte',
		states: [],
		status: 'experimental',
		summary: '保持ol/ul/li语义、稳定key与可定制项目内容的List。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._small;
			s.margin.px(0);
			s.paddingInlineStart._xlarge;
		},
		variants: {},
		defaultVariants: {}
	});
	const itemRecipe = defineRecipe({
		base: (s) => s.paddingBlock._small,
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	registerRecipeHmr(import.meta, itemRecipe);
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
		item,
		items,
		ordered = false,
		ref = $bindable(null),
		style,
		...rest
	}: ZListProps = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(recipe));
	const itemClass = $derived(zui.recipe(itemRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const seen = $derived.by(() => {
		// This set is local validation scratch space, not reactive state.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const keys = new Set<number | string>();
		for (const entry of items) {
			if (keys.has(entry.id)) throw new Error(`Duplicate ZList id "${entry.id}".`);
			keys.add(entry.id);
		}
		return items;
	});
</script>

{#if ordered}<ol
		{...rest}
		bind:this={ref}
		class={[rootClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables }}
	>
		{#each seen as entry (entry.id)}<li class={itemClass}>
				{#if item}{@render item(entry)}{:else}<strong>{entry.label}</strong
					>{#if entry.description}<div>{entry.description}</div>{/if}{/if}
			</li>{/each}
	</ol>{:else}<ul
		{...rest}
		bind:this={ref}
		class={[rootClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables }}
	>
		{#each seen as entry (entry.id)}<li class={itemClass}>
				{#if item}{@render item(entry)}{:else}<strong>{entry.label}</strong
					>{#if entry.description}<div>{entry.description}</div>{/if}{/if}
			</li>{/each}
	</ul>{/if}
