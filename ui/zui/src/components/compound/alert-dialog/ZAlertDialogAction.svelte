<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZButtonProps } from '../../gene/ZButton.svelte';

	export type ZAlertDialogActionProps = Omit<ZButtonProps, 'onclick' | 'loading'> & {
		readonly onclick?: ZButtonProps['onclick'];
	};
	export const zuiMetadata = {
		category: 'overlay',
		id: 'alert-dialog-action',
		importStatement: "import { ZAlertDialogAction } from '@zadmin/zui';",
		name: 'ZAlertDialogAction',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZAlertDialog async context', 'ZButton'],
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
				default: "'primary'",
				description: '继承ZButton视觉强调层级。',
				name: 'variant',
				type: "'primary' | 'secondary' | 'ghost'"
			},
			{
				default: "'danger'",
				description: '默认使用危险语义，可由调用方明确覆盖。',
				name: 'tone',
				type: "'default' | 'danger'"
			},
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
		states: [{ description: '异步Action未settle。', name: 'data-pending', values: ['true'] }],
		status: 'experimental',
		summary: '默认danger视觉并显式确认AlertDialog；业务回调可阻止关闭。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZButton from '../../gene/ZButton.svelte';
	import { useZAlertDialog } from './context.svelte.js';

	let {
		onclick,
		ref = $bindable(null),
		tone = 'danger',
		variant = 'primary',
		...rest
	}: ZAlertDialogActionProps = $props();
	const dialog = useZAlertDialog();
	$effect(() => {
		dialog.setAction(ref);
		return () => {
			if (dialog.action === ref) dialog.setAction(null);
		};
	});
	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented) dialog.confirm(event);
	}
</script>

<ZButton
	{...rest}
	bind:ref
	disabled={dialog.pending || rest.disabled}
	loading={dialog.pending}
	data-pending={dialog.pending || undefined}
	onclick={handleClick}
	{tone}
	{variant}
/>
