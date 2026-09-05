<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZDialogCloseProps } from '../dialog/ZDialogClose.svelte';

	export type ZDrawerCloseProps = ZDialogCloseProps;
	export const zuiMetadata = {
		category: 'overlay',
		id: 'drawer-close',
		importStatement: "import { ZDrawerClose } from '@zadmin/zui';",
		name: 'ZDrawerClose',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZDrawer', 'ZDialogClose'],
		events: [
			{
				description: 'preventDefault可取消关闭。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [{ description: '关闭Drawer。', key: 'Enter / Space' }],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '真实button引用。',
				name: 'ref',
				type: 'HTMLButtonElement | null'
			}
		],
		since: '0.2.0',
		snippets: [{ description: 'Close内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/drawer/ZDrawerClose.svelte',
		states: [],
		status: 'stable',
		summary: '显式关闭Drawer并恢复Trigger焦点。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZDialogClose from '../dialog/ZDialogClose.svelte';

	let { ref = $bindable(null), ...rest }: ZDrawerCloseProps = $props();
</script>

<ZDialogClose {...rest} bind:ref />
