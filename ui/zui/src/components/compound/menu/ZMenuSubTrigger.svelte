<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { MenuActionEvent } from './context.svelte.js';
	import type { ZMenuItemProps } from './ZMenuItem.svelte';

	export interface ZMenuSubTriggerProps extends Omit<
		ZMenuItemProps,
		'checked' | 'children' | 'closeOnSelect' | 'href' | 'id' | 'itemRole' | 'onSelect' | 'trailing'
	> {
		readonly children?: Snippet;
		readonly onSelect?: (event: MenuActionEvent) => void;
		readonly openOnHover?: boolean;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'menu-sub-trigger',
		importStatement: "import { ZMenuSubTrigger } from '@zadmin/zui';",
		name: 'ZMenuSubTrigger',
		bindings: [{ description: '真实父menuitem引用。', name: 'ref', type: 'HTMLElement | null' }],
		dependencies: ['ZMenuSub', 'ZMenuItem', 'ZPopover', 'Lucide'],
		events: [
			{
				description: '进入submenu前可取消。',
				name: 'onSelect',
				type: '(event: MenuActionEvent) => void'
			}
		],
		keyboard: [{ description: '打开并聚焦首项。', key: 'Enter / Space / ArrowRight（RTL反转）' }],
		parts: [{ description: 'RTL感知的Lucide方向指示器。', name: 'indicator' }],
		props: [
			{
				default: 'true',
				description: 'pointer经过时是否打开submenu。',
				name: 'openOnHover',
				type: 'boolean'
			}
		],
		since: '0.2.0',
		snippets: [{ description: '父Item标签。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/menu/ZMenuSubTrigger.svelte',
		states: [{ description: 'submenu状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'stable',
		summary: '复用ZMenuItem集合与焦点合同、公开完整ARIA关系的Submenu Trigger。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { isKeyboardComposing } from '../../../runtime/collection/collection-navigation.svelte.js';
	import { useZPopover } from '../popover/context.svelte.js';
	import { useZMenu } from './context.svelte.js';
	import { useZMenuSub } from './submenu-context.svelte.js';
	import ZMenuItem from './ZMenuItem.svelte';

	let {
		children,
		disabled = false,
		onkeydown,
		onpointermove,
		onSelect,
		openOnHover = true,
		ref = $bindable(null),
		value,
		...rest
	}: ZMenuSubTriggerProps = $props();
	const menu = useZMenu();
	const popover = useZPopover();
	const sub = useZMenuSub();
	const resolvedDisabled = $derived(disabled || menu.disabled);
	const forwardKey = $derived(menu.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');

	$effect(() => {
		sub.setTrigger(value, ref);
		popover.setTrigger(ref);
		return () => {
			if (sub.trigger === ref) sub.setTrigger(value, null);
			if (popover.trigger === ref) popover.setTrigger(null);
		};
	});

	function handleSelect(event: MenuActionEvent): void {
		onSelect?.(event);
		if (event.defaultPrevented) return;
		event.preventDefault();
		sub.openWith('first');
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLElement }): void {
		onkeydown?.(event);
		if (
			event.defaultPrevented ||
			isKeyboardComposing(event) ||
			resolvedDisabled ||
			event.key !== forwardKey
		)
			return;
		event.preventDefault();
		sub.openWith('first');
	}

	function handlePointerMove(event: PointerEvent & { currentTarget: HTMLElement }): void {
		onpointermove?.(event);
		if (!event.defaultPrevented && !resolvedDisabled && openOnHover) sub.openWith('first');
	}
</script>

{#snippet indicator()}
	{#if menu.direction === 'rtl'}<ChevronLeft size={15} />{:else}<ChevronRight size={15} />{/if}
{/snippet}

<ZMenuItem
	{...rest}
	bind:ref
	{disabled}
	id={popover.triggerId}
	aria-controls={popover.contentId}
	aria-expanded={sub.open}
	aria-haspopup="menu"
	data-state={sub.open ? 'open' : 'closed'}
	{value}
	onkeydown={handleKeydown}
	onpointermove={handlePointerMove}
	onSelect={handleSelect}
	trailing={indicator}
>
	{@render children?.()}
</ZMenuItem>
