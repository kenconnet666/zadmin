<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZDialogTitleProps } from '../dialog/ZDialogTitle.svelte';

	export type ZAlertDialogTitleProps = ZDialogTitleProps;
	export const zuiMetadata = {
		category: 'overlay',
		id: 'alert-dialog-title',
		importStatement: "import { ZAlertDialogTitle } from '@zadmin/zui';",
		name: 'ZAlertDialogTitle',
		bindings: [
			{ description: '真实heading引用。', name: 'ref', type: 'HTMLHeadingElement | null' }
		],
		dependencies: ['ZAlertDialog', 'ZDialogTitle'],
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
		since: '0.2.0',
		snippets: [{ description: 'AlertDialog标题。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/alert-dialog/ZAlertDialogTitle.svelte',
		states: [],
		status: 'stable',
		summary: '提供AlertDialog稳定可访问名称的标题。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZDialogTitle from '../dialog/ZDialogTitle.svelte';

	let { ref = $bindable(null), ...rest }: ZAlertDialogTitleProps = $props();
</script>

<ZDialogTitle {...rest} bind:ref />
