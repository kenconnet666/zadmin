<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZButtonProps } from '../../gene/ZButton.svelte';

	export type ZDialogTriggerProps = Omit<
		ZButtonProps,
		'aria-controls' | 'aria-expanded' | 'aria-haspopup' | 'onclick'
	> & { readonly onclick?: ZButtonProps['onclick'] };

	export const zuiMetadata = {
		category: 'overlay',
		id: 'dialog-trigger',
		importStatement: "import { ZDialogTrigger } from '@zadmin/zui';",
		name: 'ZDialogTrigger',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZDialog', 'ZButton'],
		events: [
			{
				description: '原生click回调；preventDefault可取消打开。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [{ description: '打开Dialog。', key: 'Enter / Space' }],
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
		snippets: [{ description: 'Trigger内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/dialog/ZDialogTrigger.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '复用ZButton并建立Dialog aria关系的Trigger。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZButton from '../../gene/ZButton.svelte';
	import { useZDialog } from './context.svelte.js';
	let { onclick, ref = $bindable(null), ...rest }: ZDialogTriggerProps = $props();
	const dialog = useZDialog();
	$effect(() => {
		dialog.setTrigger(ref);
		return () => {
			if (dialog.trigger === ref) dialog.setTrigger(null);
		};
	});
	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented) dialog.setOpen(true);
	}
</script>

<ZButton
	{...rest}
	bind:ref
	id={dialog.triggerId}
	aria-controls={dialog.contentId}
	aria-expanded={dialog.open}
	aria-haspopup="dialog"
	data-state={dialog.open ? 'open' : 'closed'}
	onclick={handleClick}
/>
