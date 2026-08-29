<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	export interface ZContextMenuTriggerProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children'
	> {
		readonly children?: Snippet;
		ref?: HTMLDivElement | null;
	}
	export const zuiMetadata = {
		category: 'navigation',
		id: 'context-menu-trigger',
		importStatement: "import { ZContextMenuTrigger } from '@zadmin/zui';",
		name: 'ZContextMenuTrigger',
		bindings: [{ description: '真实目标区域引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['ZContextMenu'],
		events: [
			{
				description: '原生contextmenu；preventDefault可取消打开。',
				name: 'oncontextmenu',
				type: 'MouseEventHandler<HTMLDivElement>'
			}
		],
		keyboard: [{ description: '在目标逻辑起点打开Menu。', key: 'ContextMenu / Shift+F10' }],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '真实目标区域引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: '0.4.0',
		snippets: [{ description: '可右键或键盘打开的目标内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/context-menu/ZContextMenuTrigger.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '捕获contextmenu与键盘手势并更新真实坐标锚点。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { useZPopover } from '../popover/context.svelte.js';
	let {
		children,
		oncontextmenu,
		onkeydown,
		ref = $bindable(null),
		tabindex = 0,
		...rest
	}: ZContextMenuTriggerProps = $props();
	const popover = useZPopover();
	let anchor = $state<HTMLSpanElement | null>(null);
	let x = $state(0);
	let y = $state(0);
	$effect(() => {
		popover.setTrigger(anchor);
		return () => {
			if (popover.trigger === anchor) popover.setTrigger(null);
		};
	});
	function openAt(clientX: number, clientY: number): void {
		x = clientX;
		y = clientY;
		ref?.focus({ preventScroll: true });
		popover.setOpen(true);
	}
	function handleContextMenu(event: MouseEvent & { currentTarget: HTMLDivElement }): void {
		oncontextmenu?.(event);
		if (!event.defaultPrevented) {
			event.preventDefault();
			openAt(event.clientX, event.clientY);
		}
	}
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		if (event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)) {
			event.preventDefault();
			const rect = event.currentTarget.getBoundingClientRect();
			openAt(rect.left, rect.bottom);
		}
	}
</script>

<!-- The context target is intentionally keyboard focusable for ContextMenu and Shift+F10. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	{...rest}
	bind:this={ref}
	{tabindex}
	aria-controls={popover.contentId}
	aria-expanded={popover.open}
	aria-haspopup="menu"
	data-state={popover.open ? 'open' : 'closed'}
	oncontextmenu={handleContextMenu}
	onkeydown={handleKeydown}
>
	{@render children?.()}
	<span
		bind:this={anchor}
		aria-hidden="true"
		style={`position: fixed; left: ${x}px; top: ${y}px; width: 0; height: 0; pointer-events: none;`}
	></span>
</div>
