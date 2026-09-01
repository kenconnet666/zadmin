<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZDialogDescriptionProps } from '../dialog/ZDialogDescription.svelte';

	export type ZAlertDialogDescriptionProps = ZDialogDescriptionProps;
	export const zuiMetadata = {
		category: 'overlay',
		id: 'alert-dialog-description',
		importStatement: "import { ZAlertDialogDescription } from '@zadmin/zui';",
		name: 'ZAlertDialogDescription',
		bindings: [
			{ description: '真实paragraph引用。', name: 'ref', type: 'HTMLParagraphElement | null' }
		],
		dependencies: ['ZAlertDialog', 'ZDialogDescription'],
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
		since: 'unreleased',
		snippets: [{ description: '后果与恢复路径说明。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/alert-dialog/ZAlertDialogDescription.svelte',
		states: [],
		status: 'experimental',
		summary: '提供AlertDialog稳定可访问说明与操作后果。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZDialogDescription from '../dialog/ZDialogDescription.svelte';

	let { ref = $bindable(null), ...rest }: ZAlertDialogDescriptionProps = $props();
</script>

<ZDialogDescription {...rest} bind:ref />
