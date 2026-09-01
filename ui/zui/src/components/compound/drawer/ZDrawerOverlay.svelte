<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZDialogOverlayProps } from '../dialog/ZDialogOverlay.svelte';

	export type ZDrawerOverlayProps = ZDialogOverlayProps;
	export const zuiMetadata = {
		category: 'overlay',
		id: 'drawer-overlay',
		importStatement: "import { ZDrawerOverlay } from '@zadmin/zui';",
		name: 'ZDrawerOverlay',
		bindings: [
			{ description: '挂载期间的真实overlay引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZDrawer', 'ZDialogOverlay'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '挂载期间的真实overlay引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/compound/drawer/ZDrawerOverlay.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '与Drawer Presence同步的modal遮罩。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZDialogOverlay from '../dialog/ZDialogOverlay.svelte';

	let { ref = $bindable(null), ...rest }: ZDrawerOverlayProps = $props();
</script>

<ZDialogOverlay {...rest} bind:ref />
