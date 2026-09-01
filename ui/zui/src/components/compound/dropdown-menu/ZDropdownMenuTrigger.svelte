<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZPopoverTriggerProps } from '../popover/ZPopoverTrigger.svelte';
	export type ZDropdownMenuTriggerProps = Omit<ZPopoverTriggerProps, 'popupRole'>;
	export const zuiMetadata = {
		category: 'navigation',
		id: 'dropdown-menu-trigger',
		importStatement: "import { ZDropdownMenuTrigger } from '@zadmin/zui';",
		name: 'ZDropdownMenuTrigger',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZDropdownMenu', 'ZPopoverTrigger'],
		events: [
			{
				description: 'preventDefault可取消切换。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [
			{ description: '切换Menu。', key: 'Enter / Space' },
			{ description: '打开并聚焦首项或末项。', key: 'ArrowDown / ArrowUp' }
		],
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
		source: 'ui/zui/src/components/compound/dropdown-menu/ZDropdownMenuTrigger.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '使用aria-haspopup=menu切换Dropdown Menu。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { isKeyboardComposing } from '../../../runtime/collection/collection-navigation.svelte.js';
	import ZPopoverTrigger from '../popover/ZPopoverTrigger.svelte';
	import { useZPopover } from '../popover/context.svelte.js';
	import { useZDropdownMenu } from './context.svelte.js';
	let {
		disabled = false,
		onclick,
		onkeydown,
		ref = $bindable(null),
		...rest
	}: ZDropdownMenuTriggerProps = $props();
	const dropdown = useZDropdownMenu();
	const popover = useZPopover();

	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		if (disabled) return;
		dropdown.prepareOpen('first');
		onclick?.(event);
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLButtonElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented || isKeyboardComposing(event) || disabled) return;
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				dropdown.prepareOpen('first');
				popover.setOpen(true);
				break;
			case 'ArrowUp':
				event.preventDefault();
				dropdown.prepareOpen('last');
				popover.setOpen(true);
				break;
		}
	}
</script>

<ZPopoverTrigger
	{...rest}
	bind:ref
	{disabled}
	popupRole="menu"
	onclick={handleClick}
	onkeydown={handleKeydown}
/>
