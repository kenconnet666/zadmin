<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { MenuActionEvent } from '../menu/context.svelte.js';
	import type { ZPopoverContentProps } from '../popover/ZPopoverContent.svelte';
	export type ZContextMenuContentProps = Omit<
		ZPopoverContentProps,
		'ariaLabelledBy' | 'children' | 'role'
	> & {
		readonly ariaLabel?: string;
		readonly children?: Snippet;
		readonly loop?: boolean;
		menuRef?: HTMLDivElement | null;
		readonly onAction?: (event: MenuActionEvent) => void;
	};
	export const zuiMetadata = {
		category: 'navigation',
		id: 'context-menu-content',
		importStatement: "import { ZContextMenuContent } from '@zadmin/zui';",
		name: 'ZContextMenuContent',
		bindings: [
			{ description: '真实floating shell引用。', name: 'ref', type: 'HTMLDivElement | null' },
			{ description: '真实menu引用。', name: 'menuRef', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZContextMenu', 'ZPopoverContent', 'ZMenu'],
		events: [
			{
				description: '未取消action后dismiss。',
				name: 'onAction',
				type: '(event: MenuActionEvent) => void'
			}
		],
		keyboard: [
			{ description: 'Menu集合导航。', key: 'Arrow keys / Home / End / Typeahead' },
			{ description: 'dismiss并恢复目标焦点。', key: 'Escape' }
		],
		parts: [],
		props: [
			{
				default: "'Context menu'",
				description: 'Menu可访问名称。',
				name: 'ariaLabel',
				type: 'string'
			},
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
		source: 'ui/zui/src/components/compound/context-menu/ZContextMenuContent.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '在坐标锚点定位bare ZMenu并管理action dismiss。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZMenu from '../menu/ZMenu.svelte';
	import ZPopoverContent from '../popover/ZPopoverContent.svelte';
	import { useZPopover } from '../popover/context.svelte.js';
	let {
		ariaLabel = 'Context menu',
		children,
		loop = true,
		menuRef = $bindable(null),
		onAction,
		ref = $bindable(null),
		...rest
	}: ZContextMenuContentProps = $props();
	const popover = useZPopover();
	function handleAction(event: MenuActionEvent): void {
		onAction?.(event);
		if (!event.defaultPrevented) popover.setOpen(false);
	}
</script>

<ZPopoverContent {...rest} ariaLabelledBy={null} bind:ref role="presentation">
	<ZMenu appearance="bare" aria-label={ariaLabel} bind:ref={menuRef} {loop} onAction={handleAction}
		>{@render children?.()}</ZMenu
	>
</ZPopoverContent>
