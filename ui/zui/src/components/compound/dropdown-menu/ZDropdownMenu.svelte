<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { PopoverPlacement } from '../popover/ZPopover.svelte';
	export interface ZDropdownMenuProps {
		readonly children?: Snippet;
		readonly defaultOpen?: boolean;
		readonly gutter?: number;
		readonly onOpenChange?: (open: boolean) => void;
		open?: boolean;
		readonly placement?: PopoverPlacement;
	}
	export const zuiMetadata = {
		category: 'navigation',
		id: 'dropdown-menu',
		importStatement:
			"import { ZDropdownMenu, ZDropdownMenuTrigger, ZDropdownMenuContent, ZMenuItem } from '@zadmin/zui';",
		name: 'ZDropdownMenu',
		bindings: [{ description: '当前打开状态。', name: 'open', type: 'boolean' }],
		dependencies: ['ZPopover', 'ZMenu', 'Floating'],
		events: [
			{
				description: '打开或dismiss后调用一次。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		keyboard: [
			{ description: '打开后焦点进入首个enabled Item。', key: 'Enter / Space' },
			{ description: '关闭并恢复Trigger焦点。', key: 'Escape' }
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
				description: '首选浮层位置。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{ default: '4', description: 'Trigger与Content间距px。', name: 'gutter', type: 'number' }
		],
		since: '0.2.0',
		snippets: [{ description: 'Trigger与Content。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/dropdown-menu/ZDropdownMenu.svelte',
		states: [],
		status: 'stable',
		summary: '组合Popover定位/dismiss与Menu集合键盘模型的Dropdown Menu根组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZPopover from '../popover/ZPopover.svelte';
	import { provideZDropdownMenu, type DropdownMenuFocusStrategy } from './context.svelte.js';
	let {
		children,
		defaultOpen = false,
		gutter = 4,
		onOpenChange,
		open = $bindable(),
		placement = 'bottom-start'
	}: ZDropdownMenuProps = $props();
	let focusStrategy = $state<DropdownMenuFocusStrategy>('first');
	provideZDropdownMenu({
		get focusStrategy() {
			return focusStrategy;
		},
		prepareOpen(strategy) {
			focusStrategy = strategy;
		}
	});
</script>

<ZPopover bind:open {defaultOpen} {gutter} modal={false} {onOpenChange} {placement}
	>{@render children?.()}</ZPopover
>
