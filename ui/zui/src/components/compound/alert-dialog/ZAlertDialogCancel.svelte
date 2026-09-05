<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZButtonProps } from '../../gene/ZButton.svelte';

	export type ZAlertDialogCancelProps = Omit<ZButtonProps, 'onclick'> & {
		readonly onclick?: ZButtonProps['onclick'];
	};
	export const zuiMetadata = {
		category: 'overlay',
		id: 'alert-dialog-cancel',
		importStatement: "import { ZAlertDialogCancel } from '@zadmin/zui';",
		name: 'ZAlertDialogCancel',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZAlertDialog async context', 'ZButton'],
		events: [
			{
				description: 'preventDefault可保持AlertDialog打开。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [{ description: '显式取消并关闭AlertDialog。', key: 'Enter / Space' }],
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
		snippets: [{ description: '取消操作内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/alert-dialog/ZAlertDialogCancel.svelte',
		states: [{ description: 'Action pending时禁用。', name: 'data-pending', values: ['true'] }],
		status: 'stable',
		summary: '默认secondary视觉并显式取消AlertDialog。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZButton from '../../gene/ZButton.svelte';
	import { useZAlertDialog } from './context.svelte.js';

	let {
		onclick,
		ref = $bindable(null),
		variant = 'secondary',
		...rest
	}: ZAlertDialogCancelProps = $props();
	const dialog = useZAlertDialog();
	$effect(() => {
		dialog.setCancel(ref);
		return () => {
			if (dialog.cancel === ref) dialog.setCancel(null);
		};
	});
	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented) dialog.cancelDialog();
	}
</script>

<ZButton
	{...rest}
	bind:ref
	disabled={dialog.pending || rest.disabled}
	data-pending={dialog.pending || undefined}
	onclick={handleClick}
	{variant}
/>
