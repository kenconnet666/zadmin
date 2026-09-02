<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZDialogContentProps } from '../dialog/ZDialogContent.svelte';

	export type ZAlertDialogContentProps = Omit<
		ZDialogContentProps,
		| 'ariaDescribedBy'
		| 'ariaLabel'
		| 'ariaLabelledBy'
		| 'dismissOnEscape'
		| 'dismissOnPointerOutside'
		| 'onEscape'
		| 'onFocusOutside'
		| 'onPointerOutside'
		| 'role'
	>;
	export const zuiMetadata = {
		category: 'overlay',
		id: 'alert-dialog-content',
		importStatement: "import { ZAlertDialogContent } from '@zadmin/zui';",
		name: 'ZAlertDialogContent',
		bindings: [
			{ description: '挂载期间的真实alertdialog引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZAlertDialog pending context', 'ZDialogContent', 'FocusScope'],
		events: [],
		keyboard: [
			{ description: '在Cancel、Action和其他可聚焦内容之间循环。', key: 'Tab / Shift+Tab' },
			{ description: '不会关闭；必须使用显式Cancel或Action。', key: 'Escape' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '挂载期间的真实alertdialog引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: 'Title、Description、业务信息、Cancel与Action。',
				name: 'children',
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/compound/alert-dialog/ZAlertDialogContent.svelte',
		states: [
			{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: 'Action尚未settle。', name: 'data-pending', values: ['true'] }
		],
		status: 'experimental',
		summary: '固定alertdialog角色并禁用Escape和outside pointer隐式关闭。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZDialogContent from '../dialog/ZDialogContent.svelte';
	import { useZDialog } from '../dialog/context.svelte.js';
	import { useZAlertDialog } from './context.svelte.js';

	let { initialFocus, ref = $bindable(null), ...rest }: ZAlertDialogContentProps = $props();
	const alertDialog = useZAlertDialog();
	const dialog = useZDialog();
	$effect(() => {
		if (ref && (!dialog.hasTitle || !dialog.hasDescription)) {
			throw new TypeError('ZAlertDialogContent requires both Title and Description.');
		}
	});
</script>

<ZDialogContent
	{...rest}
	bind:ref
	ariaDescribedBy={dialog.descriptionId}
	ariaLabelledBy={dialog.titleId}
	data-pending={alertDialog.pending || undefined}
	dismissOnEscape={false}
	dismissOnPointerOutside={false}
	initialFocus={initialFocus ?? (() => alertDialog.cancel)}
	role="alertdialog"
/>
