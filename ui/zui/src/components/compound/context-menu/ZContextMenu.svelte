<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { PopoverPlacement } from '../popover/ZPopover.svelte';
	export interface ZContextMenuProps {
		readonly children?: Snippet;
		readonly defaultOpen?: boolean;
		readonly gutter?: number;
		readonly onOpenChange?: (open: boolean) => void;
		open?: boolean;
		readonly placement?: PopoverPlacement;
	}
	export const zuiMetadata = {
		category: 'navigation',
		id: 'context-menu',
		importStatement:
			"import { ZContextMenu, ZContextMenuTrigger, ZContextMenuContent, ZMenuItem } from '@zadmin/zui';",
		name: 'ZContextMenu',
		bindings: [{ description: '当前打开状态。', name: 'open', type: 'boolean' }],
		dependencies: ['ZPopover', 'ZMenu', 'pointer coordinates'],
		events: [
			{
				description: '打开或dismiss后调用一次。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		keyboard: [
			{ description: '在目标逻辑起点打开。', key: 'ContextMenu / Shift+F10' },
			{ description: 'dismiss并恢复目标焦点。', key: 'Escape' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前打开状态。',
				name: 'open',
				type: 'boolean'
			},
			{ default: 'false', description: '非受控初始状态。', name: 'defaultOpen', type: 'boolean' },
			{
				default: "'bottom-start'",
				description: '相对指针锚点的首选位置。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{ default: '2', description: '指针锚点与Content间距px。', name: 'gutter', type: 'number' }
		],
		since: 'unreleased',
		snippets: [{ description: 'Trigger区域与Content。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/context-menu/ZContextMenu.svelte',
		states: [],
		status: 'stable',
		summary: '以真实指针坐标或键盘目标边界为锚点的Context Menu根组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZPopover from '../popover/ZPopover.svelte';
	let {
		children,
		defaultOpen = false,
		gutter = 2,
		onOpenChange,
		open = $bindable(),
		placement = 'bottom-start'
	}: ZContextMenuProps = $props();
</script>

<ZPopover bind:open {defaultOpen} {gutter} modal={false} {onOpenChange} {placement} strategy="fixed"
	>{@render children?.()}</ZPopover
>
