<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZPopoverTriggerProps } from '../popover/ZPopoverTrigger.svelte';
	export type ZMultiSelectTriggerProps = Omit<
		ZPopoverTriggerProps,
		'aria-required' | 'children' | 'disabled' | 'id' | 'popupRole'
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
		since: 'unreleased',
		snippets: [
			{ description: '自定义Trigger；省略时显示标签摘要。', name: 'children', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/compound/multi-select/ZMultiSelectTrigger.svelte',
		states: [
			{ description: '空选择。', name: 'data-placeholder', values: ['true'] },
			{ description: '业务选择值无效。', name: 'data-invalid', values: ['true'] }
		],
		status: 'experimental',
		summary: '以标签摘要显示多值并打开listbox。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { mergeAriaIds } from '../../../runtime/form/form-control.svelte.js';
	import { useZFieldControlOwner } from '../../../runtime/form/field-context.js';
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
		'aria-describedby': ariaDescribedBy,
		children,
		ref = $bindable(null),
		variant = 'secondary',
		...rest
	}: ZMultiSelectTriggerProps = $props();
	const multi = useZMultiSelect();
	const fieldOwner = useZFieldControlOwner();
	const zui = useZui();
	const tagClass = $derived(zui.recipe(tagRecipe));
	$effect(() => {
		const owner = ref;
		if (!owner || !fieldOwner) return;
		return fieldOwner.registerFocusOwner(() => owner.focus({ preventScroll: true }));
	});
</script>

<ZPopoverTrigger
	{...rest}
	aria-describedby={mergeAriaIds(ariaDescribedBy, multi.describedBy)}
	aria-invalid={multi.invalid || undefined}
	aria-required={multi.required || undefined}
	bind:ref
	disabled={multi.disabled}
	id={multi.controlId}
	popupRole="listbox"
	{variant}
	data-invalid={multi.invalid || undefined}
	data-placeholder={multi.values.length === 0 || undefined}
>
	{#if children}{@render children()}{:else if multi.labels.length === 0}{multi.placeholder}{:else}{#each multi.labels as label, index (`${label}-${index}`)}<span
				class={tagClass}
				data-slot="tag">{label}</span
			>{/each}{/if}
</ZPopoverTrigger>
