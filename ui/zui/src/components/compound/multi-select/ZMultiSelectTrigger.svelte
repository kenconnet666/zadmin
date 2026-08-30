<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZPopoverTriggerProps } from '../popover/ZPopoverTrigger.svelte';
	export type ZMultiSelectTriggerProps = Omit<
		ZPopoverTriggerProps,
		'children' | 'disabled' | 'popupRole'
	> & { readonly children?: Snippet };
	export const zuiMetadata = {
		category: 'input',
		id: 'multi-select-trigger',
		importStatement: "import { ZMultiSelectTrigger } from '@zadmin/zui';",
		name: 'ZMultiSelectTrigger',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZMultiSelect', 'ZPopoverTrigger'],
		events: [],
		keyboard: [{ description: '打开多选listbox。', key: 'Enter / Space' }],
		parts: [{ description: '默认选中标签。', name: 'tag' }],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '真实button引用。',
				name: 'ref',
				type: 'HTMLButtonElement | null'
			}
		],
		since: '0.4.0',
		snippets: [
			{ description: '自定义Trigger；省略时显示标签摘要。', name: 'children', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/compound/multi-select/ZMultiSelectTrigger.svelte',
		states: [{ description: '空选择。', name: 'data-placeholder', values: ['true'] }],
		status: 'experimental',
		summary: '以标签摘要显示多值并打开listbox。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZPopoverTrigger from '../popover/ZPopoverTrigger.svelte';
	import { useZMultiSelect } from './context.svelte.js';
	const tagRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._surface;
			s.borderRadius._small;
			s.paddingBlock._xsmall;
			s.paddingInline._small;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, tagRecipe);
	let {
		children,
		ref = $bindable(null),
		variant = 'secondary',
		...rest
	}: ZMultiSelectTriggerProps = $props();
	const multi = useZMultiSelect();
	const zui = useZui();
	const tagClass = $derived(zui.recipe(tagRecipe));
</script>

<ZPopoverTrigger
	{...rest}
	bind:ref
	disabled={multi.disabled}
	popupRole="listbox"
	{variant}
	data-placeholder={multi.values.length === 0 || undefined}
>
	{#if children}{@render children()}{:else if multi.labels.length === 0}{multi.placeholder}{:else}{#each multi.labels as label, index (`${label}-${index}`)}<span
				class={tagClass}
				data-slot="tag">{label}</span
			>{/each}{/if}
</ZPopoverTrigger>
