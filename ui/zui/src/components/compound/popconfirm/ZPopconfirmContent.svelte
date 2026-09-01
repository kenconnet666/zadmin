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
	registerRecipeHmr(import.meta, recipe);
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
		parts: [],
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
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '建立稳定名称与说明关系并聚焦显式操作的定位确认浮层。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZPopoverContent from '../popover/ZPopoverContent.svelte';
	import { useZPopconfirm } from './context.svelte.js';
	let { class: className, ref = $bindable(null), ...rest }: ZPopconfirmContentProps = $props();
	const zui = useZui();
	const popconfirm = useZPopconfirm();
	const rootClass = $derived(zui.recipe(recipe));
</script>

<ZPopoverContent
	{...rest}
	ariaDescribedBy={popconfirm.descriptionId}
	ariaLabelledBy={popconfirm.titleId}
	bind:ref
	class={[rootClass, className]}
/>
