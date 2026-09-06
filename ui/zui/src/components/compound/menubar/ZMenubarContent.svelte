<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { MenuActionEvent } from '../menu/context.svelte.js';
	import type {
		PopoverEscapeEvent,
		PopoverFocusOutsideEvent,
		PopoverPointerOutsideEvent
	} from '../popover/ZPopoverContent.svelte';
	import type { ZDropdownMenuContentProps } from '../dropdown-menu/ZDropdownMenuContent.svelte';

	export interface ZMenubarContentProps extends Omit<
		ZDropdownMenuContentProps,
		'onAction' | 'onEscape' | 'onFocusOutside' | 'onPointerOutside' | 'onkeydown' | 'restoreFocus'
	> {
		readonly children?: Snippet;
		readonly onAction?: (event: MenuActionEvent) => void;
		readonly onEscape?: (event: PopoverEscapeEvent) => void;
		readonly onFocusOutside?: (event: PopoverFocusOutsideEvent) => void;
		readonly onPointerOutside?: (event: PopoverPointerOutsideEvent) => void;
		readonly onkeydown?: ZDropdownMenuContentProps['onkeydown'];
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'menubar-content',
		name: 'ZMenubarContent',
		status: 'experimental',
		since: 'unreleased',
		source: 'ui/zui/src/components/compound/menubar/ZMenubarContent.svelte',
		importStatement: "import { ZMenubarContent } from '@zadmin/zui';",
		summary:
			'复用DropdownMenuContent和ZMenu全部命令/选择/submenu能力，只增加Menubar根切换和离开焦点。',
		dependencies: ['ZMenubar', 'ZDropdownMenuContent', 'ZMenu', 'ZPopoverContent'],
		bindings: [
			{ name: 'ref', type: 'HTMLDivElement | null', description: '真实floating shell。' },
			{ name: 'menuRef', type: 'HTMLDivElement | null', description: '真实role=menu集合。' }
		],
		events: [
			{
				name: 'onAction',
				type: '(event: MenuActionEvent) => void',
				description: '既有可取消命令事件；未取消且closeOnSelect时关闭。'
			},
			{
				name: 'onEscape',
				type: '(event: PopoverEscapeEvent) => void',
				description: '可取消Escape关闭；接受时恢复当前根trigger。'
			},
			{
				name: 'onFocusOutside',
				type: '(event: PopoverFocusOutsideEvent) => void',
				description: '焦点移到根菜单外时可取消；接受时保留实际外部焦点作为恢复目标。'
			},
			{
				name: 'onPointerOutside',
				type: '(event: PopoverPointerOutsideEvent) => void',
				description: '指针落到根菜单外时可取消；可聚焦目标成为最新恢复目标。'
			}
		],
		keyboard: [
			{
				key: 'ArrowLeft / ArrowRight',
				description: '仅从根menu切换相邻根菜单；nested submenu保留自己方向键。'
			},
			{ key: 'Tab / Shift+Tab', description: '关闭并移动到menubar后的或之前的真实Tab目标。' },
			{ key: 'ArrowUp / ArrowDown / Home / End / Typeahead', description: '完全复用内部ZMenu。' }
		],
		parts: [],
		props: [
			{
				name: 'size',
				type: 'ZControlSize',
				default: 'ZMenubar.size',
				description: '内部菜单行五档尺寸。'
			},
			{ name: 'loop', type: 'boolean', default: 'true', description: '内部ZMenu纵向焦点循环。' },
			{
				name: 'ref',
				type: 'HTMLDivElement | null',
				bindable: true,
				default: 'null',
				description: '真实floating shell引用。'
			},
			{
				name: 'menuRef',
				type: 'HTMLDivElement | null',
				bindable: true,
				default: 'null',
				description: '真实menu引用。'
			}
		],
		snippets: [
			{
				name: 'children',
				type: 'Snippet',
				description: '直接组合既有ZMenuItem、CheckboxItem、RadioGroup/Item、Sub与结构部件。'
			}
		],
		states: [
			{ name: 'data-state', values: ['open', 'closed'], description: '对应根菜单浮层状态。' }
		]
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { isFocusable } from 'tabbable';
	import { isDomHtmlElement } from '../../../runtime/layer/dom-realm.js';
	import ZDropdownMenuContent from '../dropdown-menu/ZDropdownMenuContent.svelte';
	import { useZDropdownMenu } from '../dropdown-menu/context.svelte.js';
	import { useZPopover } from '../popover/context.svelte.js';
	import { useZMenubar, useZMenubarMenu } from './context.svelte.js';

	let {
		children,
		loop = true,
		menuRef = $bindable(null),
		onAction,
		onEscape,
		onFocusOutside,
		onkeydown,
		onPointerOutside,
		ref = $bindable(null),
		size,
		...rest
	}: ZMenubarContentProps = $props();
	const menubar = useZMenubar();
	const menu = useZMenubarMenu();
	const dropdown = useZDropdownMenu();
	const popover = useZPopover();
	const resolvedSize = $derived(size ?? menubar.size);

	$effect(() => menubar.registerPrepare(menu.value, (strategy) => dropdown.prepareOpen(strategy)));
	$effect(() => menubar.registerRestore(menu.value, (target) => popover.setRestoreTarget(target)));

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		if (event.key === 'Tab') {
			const target = menubar.leaveTarget(event.shiftKey);
			if (target) {
				event.preventDefault();
				popover.setRestoreTarget(target);
				menubar.close(menu.value);
				queueMicrotask(() => target.focus({ preventScroll: true }));
			} else {
				menubar.close(menu.value);
			}
			return;
		}
		menubar.handleContentKeydown(menu.value, event);
	}

	function handleFocusOutside(event: PopoverFocusOutsideEvent): void {
		onFocusOutside?.(event);
		if (event.defaultPrevented) return;
		const target = event.originalEvent.target;
		if (isDomHtmlElement(target)) popover.setRestoreTarget(target);
	}

	function handlePointerOutside(event: PopoverPointerOutsideEvent): void {
		onPointerOutside?.(event);
		if (event.defaultPrevented) return;
		const target = event.originalEvent.target;
		if (isDomHtmlElement(target) && isFocusable(target)) popover.setRestoreTarget(target);
	}
</script>

<ZDropdownMenuContent
	{...rest}
	bind:menuRef
	bind:ref
	{loop}
	{onAction}
	{onEscape}
	onFocusOutside={handleFocusOutside}
	onkeydown={handleKeydown}
	onPointerOutside={handlePointerOutside}
	size={resolvedSize}
>
	{@render children?.()}
</ZDropdownMenuContent>
