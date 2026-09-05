<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZDialogOverlayProps } from '../dialog/ZDialogOverlay.svelte';

	export type ZAlertDialogOverlayProps = ZDialogOverlayProps;
	export const zuiMetadata = {
		category: 'overlay',
		id: 'alert-dialog-overlay',
		importStatement: "import { ZAlertDialogOverlay } from '@zadmin/zui';",
		name: 'ZAlertDialogOverlay',
		bindings: [
			{ description: '挂载期间的真实overlay引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZAlertDialog', 'ZDialogOverlay'],
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
		since: '0.2.0',
		snippets: [],
		source: 'ui/zui/src/components/compound/alert-dialog/ZAlertDialogOverlay.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'stable',
		summary: '复用Dialog modal遮罩，但不会通过outside pointer隐式关闭AlertDialog。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZDialogOverlay from '../dialog/ZDialogOverlay.svelte';

	let { ref = $bindable(null), ...rest }: ZAlertDialogOverlayProps = $props();
</script>

<ZDialogOverlay {...rest} bind:ref />
