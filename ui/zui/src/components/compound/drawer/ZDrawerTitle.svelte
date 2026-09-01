<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZDialogTitleProps } from '../dialog/ZDialogTitle.svelte';

	export type ZDrawerTitleProps = ZDialogTitleProps;
	export const zuiMetadata = {
		category: 'overlay',
		id: 'drawer-title',
		importStatement: "import { ZDrawerTitle } from '@zadmin/zui';",
		name: 'ZDrawerTitle',
		bindings: [
			{ description: '真实heading引用。', name: 'ref', type: 'HTMLHeadingElement | null' }
		],
		dependencies: ['ZDrawer', 'ZDialogTitle'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '真实heading引用。',
				name: 'ref',
				type: 'HTMLHeadingElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'Drawer标题。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/drawer/ZDrawerTitle.svelte',
		states: [],
		status: 'experimental',
		summary: '提供Drawer稳定可访问名称的标题。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZDialogTitle from '../dialog/ZDialogTitle.svelte';

	let { ref = $bindable(null), ...rest }: ZDrawerTitleProps = $props();
</script>

<ZDialogTitle {...rest} bind:ref />
