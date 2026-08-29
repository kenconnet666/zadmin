<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZDialogDescriptionProps } from '../dialog/ZDialogDescription.svelte';

	export type ZDrawerDescriptionProps = ZDialogDescriptionProps;
	export const zuiMetadata = {
		category: 'overlay',
		id: 'drawer-description',
		importStatement: "import { ZDrawerDescription } from '@zadmin/zui';",
		name: 'ZDrawerDescription',
		bindings: [
			{ description: '真实paragraph引用。', name: 'ref', type: 'HTMLParagraphElement | null' }
		],
		dependencies: ['ZDrawer', 'ZDialogDescription'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '真实paragraph引用。',
				name: 'ref',
				type: 'HTMLParagraphElement | null'
			}
		],
		since: '0.3.0',
		snippets: [{ description: 'Drawer说明。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/drawer/ZDrawerDescription.svelte',
		states: [],
		status: 'experimental',
		summary: '提供Drawer稳定可访问说明的段落。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZDialogDescription from '../dialog/ZDialogDescription.svelte';

	let { ref = $bindable(null), ...rest }: ZDrawerDescriptionProps = $props();
</script>

<ZDialogDescription {...rest} bind:ref />
