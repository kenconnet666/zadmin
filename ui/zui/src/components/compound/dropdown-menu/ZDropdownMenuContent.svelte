<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { MenuActionEvent } from '../menu/context.svelte.js';
	import type { ZPopoverContentProps } from '../popover/ZPopoverContent.svelte';
	export type ZDropdownMenuContentProps = Omit<
		ZPopoverContentProps,
		'ariaLabelledBy' | 'children' | 'role'
	> & {
		readonly children?: Snippet;
		readonly loop?: boolean;
		menuRef?: HTMLDivElement | null;
		readonly onAction?: (event: MenuActionEvent) => void;
	};
	export const zuiMetadata = {
		category: 'navigation',
		id: 'dropdown-menu-content',
		importStatement: "import { ZDropdownMenuContent } from '@zadmin/zui';",
		name: 'ZDropdownMenuContent',
		bindings: [
			{ description: '真实floating shell引用。', name: 'ref', type: 'HTMLDivElement | null' },
			{ description: '真实menu引用。', name: 'menuRef', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZDropdownMenu', 'ZPopoverContent', 'ZMenu'],
		events: [
			{
				description: 'Item激活后收到可取消事件；未取消时dismiss。',
				name: 'onAction',
				type: '(event: MenuActionEvent) => void'
			}
		],
		keyboard: [
			{ description: 'Menu集合导航。', key: 'ArrowUp / ArrowDown / Home / End / Typeahead' },
			{ description: 'dismiss并恢复焦点。', key: 'Escape' }
		],
		parts: [],
		props: [
			{ default: 'true', description: 'Item焦点是否循环。', name: 'loop', type: 'boolean' },
			{
				bindable: true,
				default: 'null',
				description: '真实floating shell引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实menu引用。',
				name: 'menuRef',
				type: 'HTMLDivElement | null'
			}
		],
		since: '0.4.0',
		snippets: [{ description: 'ZMenuItem等Menu部件。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/dropdown-menu/ZDropdownMenuContent.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: 'Portal/Floating shell内承载bare ZMenu并在未取消action后dismiss。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZMenu from '../menu/ZMenu.svelte';
	import ZPopoverContent from '../popover/ZPopoverContent.svelte';
	import { useZPopover } from '../popover/context.svelte.js';
	let {
		children,
		loop = true,
		menuRef = $bindable(null),
		onAction,
		ref = $bindable(null),
		...rest
	}: ZDropdownMenuContentProps = $props();
	const popover = useZPopover();
	function handleAction(event: MenuActionEvent): void {
		onAction?.(event);
		if (!event.defaultPrevented) popover.setOpen(false);
	}
</script>

<ZPopoverContent {...rest} ariaLabelledBy={null} bind:ref role="presentation">
	<ZMenu
		appearance="bare"
		aria-labelledby={popover.triggerId}
		bind:ref={menuRef}
		{loop}
		onAction={handleAction}
	>
		{@render children?.()}
	</ZMenu>
</ZPopoverContent>
