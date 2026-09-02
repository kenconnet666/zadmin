<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZButtonProps } from '../../gene/ZButton.svelte';

	export type ZPopoverTriggerProps = Omit<
		ZButtonProps,
		'aria-controls' | 'aria-expanded' | 'aria-haspopup' | 'onclick'
	> & {
		readonly onclick?: ZButtonProps['onclick'];
		readonly popupRole?: 'dialog' | 'listbox' | 'menu' | 'tree';
	};

	export const zuiMetadata = {
		category: 'overlay',
		id: 'popover-trigger',
		importStatement: "import { ZPopoverTrigger } from '@zadmin/zui';",
		name: 'ZPopoverTrigger',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZPopover', 'ZButton'],
		events: [
			{
				description: '原生click回调；preventDefault可取消切换。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [{ description: '切换Popover。', key: 'Enter / Space' }],
		parts: [],
		props: [
			{
				default: "'dialog'",
				description: 'aria-haspopup值，供Menu、Listbox与Tree复合封装使用。',
				name: 'popupRole',
				type: "'dialog' | 'menu' | 'listbox' | 'tree'"
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
		snippets: [{ description: 'Trigger内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/popover/ZPopoverTrigger.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'stable',
		summary: '复用ZButton并建立aria-haspopup/expanded/controls关系的Popover Trigger。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZButton from '../../gene/ZButton.svelte';
	import { useZPopover } from './context.svelte.js';

	let {
		onclick,
		popupRole = 'dialog',
		ref = $bindable(null),
		...rest
	}: ZPopoverTriggerProps = $props();
	const popover = useZPopover();

	$effect(() => {
		popover.setTrigger(ref);
		popover.setRestoreTarget(ref);
		return () => {
			if (popover.trigger === ref) popover.setTrigger(null);
			if (popover.restoreTarget === ref) popover.setRestoreTarget(null);
		};
	});

	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented) popover.setOpen(!popover.open);
	}
</script>

<ZButton
	{...rest}
	bind:ref
	id={popover.triggerId}
	aria-controls={popover.contentId}
	aria-expanded={popover.open}
	aria-haspopup={popupRole}
	data-state={popover.open ? 'open' : 'closed'}
	onclick={handleClick}
/>
