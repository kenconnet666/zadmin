<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZDialogTriggerProps } from '../dialog/ZDialogTrigger.svelte';

	export type ZAlertDialogTriggerProps = ZDialogTriggerProps;
	export const zuiMetadata = {
		category: 'overlay',
		id: 'alert-dialog-trigger',
		importStatement: "import { ZAlertDialogTrigger } from '@zadmin/zui';",
		name: 'ZAlertDialogTrigger',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZAlertDialog', 'ZButton'],
		events: [
			{
				description: 'preventDefault可取消打开。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [{ description: '打开AlertDialog。', key: 'Enter / Space' }],
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
		snippets: [{ description: 'Trigger内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/alert-dialog/ZAlertDialogTrigger.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'stable',
		summary: '建立alertdialog aria关系并打开所属AlertDialog。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZDialogTrigger from '../dialog/ZDialogTrigger.svelte';

	let { ref = $bindable(null), ...rest }: ZAlertDialogTriggerProps = $props();
</script>

<ZDialogTrigger {...rest} bind:ref />
