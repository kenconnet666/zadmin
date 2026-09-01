<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import type { ZPopoverContentProps } from '../popover/ZPopoverContent.svelte';
	export type ZPopconfirmContentProps = Omit<
		ZPopoverContentProps,
		'aria-describedby' | 'ariaDescribedBy' | 'ariaLabelledBy'
	>;
	const recipe = defineRecipe({
		base: (s) => {
			s.maxWidth.vw(90);
			s.width._popconfirm;
		},
		variants: {},
		defaultVariants: {}
	});
	const errorRecipe = defineRecipe({
		base: (s) => {
			s.color._danger;
			s.fontSize._small;
			s.marginTop._medium;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	registerRecipeHmr(import.meta, errorRecipe);
	export const zuiMetadata = {
		category: 'overlay',
		id: 'popconfirm-content',
		importStatement: "import { ZPopconfirmContent } from '@zadmin/zui';",
		name: 'ZPopconfirmContent',
		bindings: [
			{ description: '挂载期间的真实dialog引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZPopconfirm', 'ZPopoverContent'],
		events: [],
		keyboard: [{ description: 'dismiss并恢复Trigger焦点。', key: 'Escape' }],
		parts: [{ description: '确认reject后的polite错误状态。', name: 'error' }],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '挂载期间的真实dialog引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: 'Title、Description、Cancel与Action。', name: 'children', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/compound/popconfirm/ZPopconfirmContent.svelte',
		states: [
			{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: '确认Promise尚未settle。', name: 'data-pending', values: ['true'] },
			{ description: '当前generation确认失败。', name: 'data-error', values: ['true'] }
		],
		status: 'experimental',
		summary: '建立稳定名称与说明关系并聚焦显式操作的定位确认浮层。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZPopoverContent from '../popover/ZPopoverContent.svelte';
	import { useZPopconfirm } from './context.svelte.js';
	let {
		children,
		class: className,
		ref = $bindable(null),
		...rest
	}: ZPopconfirmContentProps = $props();
	const zui = useZui();
	const popconfirm = useZPopconfirm();
	const rootClass = $derived(zui.recipe(recipe));
	const errorClass = $derived(zui.recipe(errorRecipe));
	const describedBy = $derived(
		`${popconfirm.descriptionId}${popconfirm.errorMessage ? ` ${popconfirm.errorId}` : ''}`
	);
</script>

<ZPopoverContent
	{...rest}
	ariaDescribedBy={describedBy}
	ariaLabelledBy={popconfirm.titleId}
	bind:ref
	class={[rootClass, className]}
	data-error={popconfirm.errorMessage ? true : undefined}
	data-pending={popconfirm.pending || undefined}
>
	{@render children?.()}
	{#if popconfirm.errorMessage}
		<div
			class={errorClass}
			id={popconfirm.errorId}
			role="status"
			aria-atomic="true"
			aria-live="polite"
			data-slot="error"
		>
			{popconfirm.errorMessage}
		</div>
	{/if}
</ZPopoverContent>
