<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZDialogCloseProps } from '../dialog/ZDialogClose.svelte';

	export type ZAlertDialogActionProps = ZDialogCloseProps;
	export const zuiMetadata = {
		category: 'overlay',
		id: 'alert-dialog-action',
		importStatement: "import { ZAlertDialogAction } from '@zadmin/zui';",
		name: 'ZAlertDialogAction',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZAlertDialog', 'ZDialogClose', 'ZButton'],
		events: [
			{
				description: '先执行操作；preventDefault可保持AlertDialog打开。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [{ description: '显式确认并关闭AlertDialog。', key: 'Enter / Space' }],
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
		since: 'unreleased',
		snippets: [{ description: '确认操作内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/alert-dialog/ZAlertDialogAction.svelte',
		states: [],
		status: 'experimental',
		summary: '默认danger视觉并显式确认AlertDialog；业务回调可阻止关闭。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZDialogClose from '../dialog/ZDialogClose.svelte';

	let { ref = $bindable(null), variant = 'danger', ...rest }: ZAlertDialogActionProps = $props();
</script>

<ZDialogClose {...rest} {variant} bind:ref />
