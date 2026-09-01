<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';

	export interface ZAlertDialogProps {
		readonly children?: Snippet;
		readonly defaultOpen?: boolean;
		readonly onOpenChange?: (open: boolean) => void;
		open?: boolean;
	}

	export const zuiMetadata = {
		category: 'overlay',
		id: 'alert-dialog',
		importStatement:
			"import { ZAlertDialog, ZAlertDialogTrigger, ZAlertDialogOverlay, ZAlertDialogContent, ZAlertDialogTitle, ZAlertDialogDescription, ZAlertDialogCancel, ZAlertDialogAction } from '@zadmin/zui';",
		name: 'ZAlertDialog',
		bindings: [{ description: '当前打开状态。', name: 'open', type: 'boolean' }],
		dependencies: ['ZDialog', 'FocusScope', 'inert others', 'scroll lock'],
		events: [
			{
				description: '用户显式打开、取消或确认后调用一次。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		keyboard: [
			{ description: '在Trigger、Cancel与Action之间使用原生按钮键盘语义。', key: 'Enter / Space' },
			{ description: '在AlertDialog中循环焦点；Escape不会隐式关闭。', key: 'Tab / Escape' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前打开状态。',
				name: 'open',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '非受控初始打开状态。',
				name: 'defaultOpen',
				type: 'boolean'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'AlertDialog复合部件。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/alert-dialog/ZAlertDialog.svelte',
		states: [],
		status: 'experimental',
		summary: '建立强制显式取消或确认语义的modal alertdialog复合根组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZDialog from '../dialog/ZDialog.svelte';

	let {
		children,
		defaultOpen = false,
		onOpenChange,
		open = $bindable()
	}: ZAlertDialogProps = $props();
</script>

<ZDialog bind:open {defaultOpen} {onOpenChange}>
	{@render children?.()}
</ZDialog>
