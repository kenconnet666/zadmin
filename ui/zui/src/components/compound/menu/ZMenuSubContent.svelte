<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { MenuActionEvent } from './context.svelte.js';
	import type {
		PopoverFocusOutsideEvent,
		PopoverPointerOutsideEvent,
		ZPopoverContentProps
	} from '../popover/ZPopoverContent.svelte';

	export type ZMenuSubContentProps = Omit<
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
		id: 'menu-sub-content',
		importStatement: "import { ZMenuSubContent } from '@zadmin/zui';",
		name: 'ZMenuSubContent',
		bindings: [
			{ description: '真实floating shell引用。', name: 'ref', type: 'HTMLDivElement | null' },
			{ description: '真实submenu引用。', name: 'menuRef', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZMenuSub', 'ZPopoverContent', 'ZMenu', 'Nested DismissableLayer'],
		events: [
			{
				description: 'Action向父Menu冒泡前调用。',
				name: 'onAction',
				type: '(event: MenuActionEvent) => void'
			}
		],
		keyboard: [
			{ description: '关闭当前submenu并恢复父Item焦点。', key: 'Escape / ArrowLeft（RTL反转）' }
		],
		parts: [],
		props: [
			{
				default: '父Item',
				description: '覆盖submenu原生可访问名称。',
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
			{
				default: 'true',
				description: 'submenu内部roving是否循环。',
				name: 'loop',
				type: 'boolean'
			},
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
				description: '真实submenu引用。',
				name: 'menuRef',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: '嵌套Menu部件。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/menu/ZMenuSubContent.svelte',
		states: [
			{ description: '打开与退出Presence状态。', name: 'data-state', values: ['open', 'closed'] }
		],
		status: 'stable',
		summary: '以独立ZMenu承载嵌套集合、共享父action链与顶层Layer顺序的Submenu Content。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZPopoverContent from '../popover/ZPopoverContent.svelte';
	import { useZPopover } from '../popover/context.svelte.js';
	import { useZMenu } from './context.svelte.js';
	import { useZMenuSub } from './submenu-context.svelte.js';
	import ZMenu from './ZMenu.svelte';
	import { menuPopupContentRecipe } from './popup-style.js';

	let {
		'aria-label': ariaLabelNative,
		ariaLabel,
		children,
		class: className,
		loop = true,
		menuRef = $bindable(null),
		onAction,
		onFocusOutside,
		onkeydown,
		onPointerOutside,
		ref = $bindable(null),
		...rest
	}: ZMenuSubContentProps = $props();
	const zui = useZui();
	const parentMenu = useZMenu();
	const popover = useZPopover();
	const sub = useZMenuSub();
	const resolvedAriaLabel = $derived(ariaLabelNative ?? ariaLabel);
	const popupClass = $derived(zui.recipe(menuPopupContentRecipe));
	const backwardKey = $derived(parentMenu.direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft');

	function initialFocus(): HTMLElement | null {
		const items = menuRef?.querySelectorAll<HTMLElement>(
			'[role^="menuitem"]:not([aria-disabled="true"])'
		);
		if (!items || items.length === 0) return menuRef;
		return sub.focusStrategy === 'last' ? (items.item(items.length - 1) ?? menuRef) : items.item(0);
	}

	function handleAction(event: MenuActionEvent): void {
		onAction?.(event);
		if (event.defaultPrevented) return;
		parentMenu.relayAction(event);
		if (!event.defaultPrevented && event.closeOnSelect) sub.close();
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented || event.key !== backwardKey) return;
		event.preventDefault();
		sub.close();
		queueMicrotask(() => sub.trigger?.focus({ preventScroll: true }));
	}

	function handleFocusOutside(event: PopoverFocusOutsideEvent): void {
		onFocusOutside?.(event);
		if (!event.defaultPrevented && !parentMenu.contains(event.originalEvent.target)) {
			parentMenu.dismissPopup();
		}
	}

	function handlePointerOutside(event: PopoverPointerOutsideEvent): void {
		onPointerOutside?.(event);
		if (!event.defaultPrevented && !parentMenu.contains(event.originalEvent.target)) {
			parentMenu.dismissPopup();
		}
	}
</script>

<ZPopoverContent
	{...rest}
	ariaLabelledBy={null}
	bind:ref
	class={[popupClass, className]}
	{initialFocus}
	role="presentation"
	onFocusOutside={handleFocusOutside}
	onkeydown={handleKeydown}
	onPointerOutside={handlePointerOutside}
>
	<ZMenu
		appearance="bare"
		aria-label={resolvedAriaLabel}
		aria-labelledby={resolvedAriaLabel === undefined ? popover.triggerId : undefined}
		bind:ref={menuRef}
		{loop}
		onAction={handleAction}
		onDismissRequest={() => parentMenu.dismissPopup()}
	>
		{@render children?.()}
	</ZMenu>
</ZPopoverContent>
