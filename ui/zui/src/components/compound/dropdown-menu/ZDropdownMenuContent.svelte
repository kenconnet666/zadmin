<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { MenuActionEvent } from '../menu/context.svelte.js';
	import type { ZPopoverContentProps } from '../popover/ZPopoverContent.svelte';
	export type ZDropdownMenuContentProps = Omit<
		ZPopoverContentProps,
		'ariaLabelledBy' | 'children' | 'initialFocus' | 'manageFocus' | 'role'
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
		since: '0.2.0',
		snippets: [{ description: 'ZMenuItem等Menu部件。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/dropdown-menu/ZDropdownMenuContent.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'stable',
		summary: 'Portal/Floating shell内承载bare ZMenu并在未取消action后dismiss。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZMenu from '../menu/ZMenu.svelte';
	import { menuPopupContentRecipe } from '../menu/popup-style.js';
	import ZPopoverContent from '../popover/ZPopoverContent.svelte';
	import { useZPopover } from '../popover/context.svelte.js';
	import { useZDropdownMenu } from './context.svelte.js';
	let {
		children,
		class: className,
		loop = true,
		menuRef = $bindable(null),
		onAction,
		ref = $bindable(null),
		...rest
	}: ZDropdownMenuContentProps = $props();
	const zui = useZui();
	const popover = useZPopover();
	const dropdown = useZDropdownMenu();
	const popupClass = $derived(zui.recipe(menuPopupContentRecipe));
	function initialFocus(): HTMLElement | null {
		const items = menuRef?.querySelectorAll<HTMLElement>(
			'[role^="menuitem"]:not([aria-disabled="true"])'
		);
		if (!items || items.length === 0) return menuRef;
		return dropdown.focusStrategy === 'last'
			? (items.item(items.length - 1) ?? menuRef)
			: items.item(0);
	}
	function handleAction(event: MenuActionEvent): void {
		onAction?.(event);
		if (!event.defaultPrevented && event.closeOnSelect) popover.setOpen(false);
	}
</script>

<ZPopoverContent
	{...rest}
	ariaLabelledBy={null}
	bind:ref
	class={[popupClass, className]}
	{initialFocus}
	role="presentation"
>
	<ZMenu
		appearance="bare"
		aria-labelledby={popover.triggerId}
		bind:ref={menuRef}
		{loop}
		onAction={handleAction}
		onDismissRequest={() => popover.setOpen(false)}
	>
		{@render children?.()}
	</ZMenu>
</ZPopoverContent>
