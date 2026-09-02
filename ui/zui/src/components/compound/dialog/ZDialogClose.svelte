<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZButtonProps } from '../../gene/ZButton.svelte';
	export type ZDialogCloseProps = Omit<ZButtonProps, 'onclick'> & {
		readonly onclick?: ZButtonProps['onclick'];
	};
	export const zuiMetadata = {
		category: 'overlay',
		id: 'dialog-close',
		importStatement: "import { ZDialogClose } from '@zadmin/zui';",
		name: 'ZDialogClose',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZDialog', 'ZButton'],
		events: [
			{
				description: '原生click回调；preventDefault可取消关闭。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [{ description: '关闭Dialog。', key: 'Enter / Space' }],
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
		snippets: [{ description: 'Close内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/dialog/ZDialogClose.svelte',
		states: [],
		status: 'stable',
		summary: '复用ZButton并关闭所属Dialog的显式操作。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZButton from '../../gene/ZButton.svelte';
	import { useZDialog } from './context.svelte.js';
	let { onclick, ref = $bindable(null), ...rest }: ZDialogCloseProps = $props();
	const dialog = useZDialog();
	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented) dialog.setOpen(false);
	}
</script>

<ZButton {...rest} bind:ref onclick={handleClick} />
