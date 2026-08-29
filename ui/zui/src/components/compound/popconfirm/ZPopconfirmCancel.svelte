<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZButtonProps } from '../../gene/ZButton.svelte';
	export type ZPopconfirmCancelProps = Omit<ZButtonProps, 'onclick'> & {
		readonly onclick?: ZButtonProps['onclick'];
	};
	export const zuiMetadata = {
		category: 'overlay',
		id: 'popconfirm-cancel',
		importStatement: "import { ZPopconfirmCancel } from '@zadmin/zui';",
		name: 'ZPopconfirmCancel',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZPopconfirm', 'ZButton'],
		events: [
			{
				description: 'preventDefault可保持Popconfirm打开。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [{ description: '显式取消并关闭。', key: 'Enter / Space' }],
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
		since: '0.3.0',
		snippets: [{ description: '取消操作内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/popconfirm/ZPopconfirmCancel.svelte',
		states: [],
		status: 'experimental',
		summary: '默认secondary视觉并显式取消Popconfirm。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZButton from '../../gene/ZButton.svelte';
	import { useZPopover } from '../popover/context.svelte.js';
	let {
		onclick,
		ref = $bindable(null),
		variant = 'secondary',
		...rest
	}: ZPopconfirmCancelProps = $props();
	const popover = useZPopover();
	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented) popover.setOpen(false);
	}
</script>

<ZButton {...rest} bind:ref {variant} onclick={handleClick} />
