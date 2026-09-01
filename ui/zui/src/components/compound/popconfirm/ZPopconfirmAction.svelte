<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZButtonProps } from '../../gene/ZButton.svelte';
	export type ZPopconfirmActionProps = Omit<ZButtonProps, 'onclick'> & {
		readonly onclick?: ZButtonProps['onclick'];
	};
	export const zuiMetadata = {
		category: 'overlay',
		id: 'popconfirm-action',
		importStatement: "import { ZPopconfirmAction } from '@zadmin/zui';",
		name: 'ZPopconfirmAction',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZPopconfirm', 'ZButton'],
		events: [
			{
				description: '先执行操作；preventDefault可保持Popconfirm打开。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [{ description: '显式确认并关闭。', key: 'Enter / Space' }],
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
		source: 'ui/zui/src/components/compound/popconfirm/ZPopconfirmAction.svelte',
		states: [],
		status: 'experimental',
		summary: '默认danger视觉并显式确认Popconfirm。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZButton from '../../gene/ZButton.svelte';
	import { useZPopover } from '../popover/context.svelte.js';
	let {
		onclick,
		ref = $bindable(null),
		variant = 'danger',
		...rest
	}: ZPopconfirmActionProps = $props();
	const popover = useZPopover();
	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented) popover.setOpen(false);
	}
</script>

<ZButton {...rest} bind:ref {variant} onclick={handleClick} />
