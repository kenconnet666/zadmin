<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { MenuActionEvent } from '../menu/context.svelte.js';
	import type { ZPopoverContentProps } from '../popover/ZPopoverContent.svelte';
	export type ZContextMenuContentProps = Omit<
		ZPopoverContentProps,
		'aria-label' | 'ariaLabelledBy' | 'children' | 'initialFocus' | 'manageFocus' | 'role'
	> & {
		readonly 'aria-label'?: string;
		/** @deprecated Use the native `aria-label` spelling. */
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
				name: 'aria-label',
				type: 'string'
			},
			{
				default: 'undefined',
				description: 'deprecated兼容别名；请改用aria-label。',
				name: 'ariaLabel',
				type: 'string',
				deprecatedSince: 'unreleased',
				replacement: 'aria-label',
				replacementExternal: true
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
		since: 'unreleased',
		snippets: [{ description: 'ZMenuItem等Menu部件。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/context-menu/ZContextMenuContent.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'stable',
		summary: '在坐标锚点定位bare ZMenu并管理action dismiss。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZMenu from '../menu/ZMenu.svelte';
	import { menuPopupContentRecipe } from '../menu/popup-style.js';
	import ZPopoverContent from '../popover/ZPopoverContent.svelte';
	import { useZPopover } from '../popover/context.svelte.js';
	let {
		'aria-label': ariaLabelNative,
		ariaLabel,
		children,
		class: className,
		loop = true,
		menuRef = $bindable(null),
		onAction,
		ref = $bindable(null),
		...rest
	}: ZContextMenuContentProps = $props();
	const zui = useZui();
	const popover = useZPopover();
	const resolvedAriaLabel = $derived(ariaLabelNative ?? ariaLabel ?? 'Context menu');
	const popupClass = $derived(zui.recipe(menuPopupContentRecipe));
	function initialFocus(): HTMLElement | null {
		return (
			menuRef?.querySelector<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ??
			menuRef
		);
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
		aria-label={resolvedAriaLabel}
		bind:ref={menuRef}
		{loop}
		onAction={handleAction}
		onDismissRequest={() => popover.setOpen(false)}>{@render children?.()}</ZMenu
	>
</ZPopoverContent>
