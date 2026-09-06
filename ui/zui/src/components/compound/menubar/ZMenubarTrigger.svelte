<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZDropdownMenuTriggerProps } from '../dropdown-menu/ZDropdownMenuTrigger.svelte';

	export interface ZMenubarTriggerProps extends Omit<
		ZDropdownMenuTriggerProps,
		'disabled' | 'onfocus' | 'onkeydown' | 'onpointermove' | 'role'
	> {
		readonly disabled?: boolean;
		readonly onfocus?: ZDropdownMenuTriggerProps['onfocus'];
		readonly onkeydown?: ZDropdownMenuTriggerProps['onkeydown'];
		readonly onpointermove?: ZDropdownMenuTriggerProps['onpointermove'];
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'menubar-trigger',
		name: 'ZMenubarTrigger',
		status: 'experimental',
		since: 'unreleased',
		source: 'ui/zui/src/components/compound/menubar/ZMenubarTrigger.svelte',
		importStatement: "import { ZMenubarTrigger } from '@zadmin/zui';",
		summary: '作为真实button/menuitem注册根级焦点，并复用Dropdown trigger的打开和ARIA关系。',
		dependencies: ['ZMenubar', 'ZDropdownMenuTrigger', 'ZButton'],
		bindings: [
			{ name: 'ref', type: 'HTMLButtonElement | null', description: '真实根menuitem button。' }
		],
		events: [
			{
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>',
				description: '先调用用户处理器；未取消时由Dropdown切换。'
			},
			{
				name: 'onkeydown',
				type: 'KeyboardEventHandler<HTMLButtonElement>',
				description: '先调用用户处理器；取消后Menubar和Dropdown均不处理。'
			}
		],
		keyboard: [
			{ key: 'ArrowLeft / ArrowRight / Home / End', description: '根级trigger导航。' },
			{ key: 'ArrowDown / ArrowUp', description: '打开并聚焦首项或末项。' },
			{ key: 'Enter / Space', description: '复用真实Dropdown button切换。' }
		],
		parts: [],
		props: [
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				description: '退出根roving并阻止打开。'
			},
			{
				name: 'ref',
				type: 'HTMLButtonElement | null',
				bindable: true,
				default: 'null',
				description: '真实button引用。'
			}
		],
		snippets: [{ name: 'children', type: 'Snippet', description: '根菜单可见标签。' }],
		states: [{ name: 'data-state', values: ['open', 'closed'], description: '对应Dropdown状态。' }]
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZDropdownMenuTrigger from '../dropdown-menu/ZDropdownMenuTrigger.svelte';
	import { useZMenubar, useZMenubarMenu } from './context.svelte.js';

	let {
		disabled = false,
		onfocus,
		onkeydown,
		onpointermove,
		ref = $bindable(null),
		size,
		variant = 'ghost',
		...rest
	}: ZMenubarTriggerProps = $props();
	const menubar = useZMenubar();
	const menu = useZMenubarMenu();
	const resolvedDisabled = $derived(disabled || menu.disabled);
	const resolvedSize = $derived(size ?? menubar.size);

	$effect(() =>
		menubar.register(() => ({
			disabled: resolvedDisabled,
			element: ref,
			groupKey: undefined,
			key: menu.value,
			selectionDisabled: true,
			textValue: ref?.textContent?.trim() || String(menu.value)
		}))
	);

	function handleFocus(event: FocusEvent & { currentTarget: HTMLButtonElement }): void {
		onfocus?.(event);
		menubar.focus(menu.value, 'pointer');
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLButtonElement }): void {
		onkeydown?.(event);
		if (!event.defaultPrevented) menubar.handleTriggerKeydown(menu.value, event);
	}

	function handlePointerMove(event: PointerEvent & { currentTarget: HTMLButtonElement }): void {
		onpointermove?.(event);
		if (!event.defaultPrevented && !resolvedDisabled) menubar.pointerMove(menu.value);
	}
</script>

<ZDropdownMenuTrigger
	{...rest}
	bind:ref
	disabled={resolvedDisabled}
	role="menuitem"
	size={resolvedSize}
	tabindex={menubar.tabIndex(menu.value, resolvedDisabled)}
	{variant}
	onfocus={handleFocus}
	onkeydown={handleKeydown}
	onpointermove={handlePointerMove}
/>
