<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { PopoverPlacement } from '../popover/ZPopover.svelte';

	export interface ZMenuSubProps {
		readonly children?: Snippet;
		readonly defaultOpen?: boolean;
		readonly gutter?: number;
		readonly onOpenChange?: (open: boolean) => void;
		open?: boolean;
		readonly placement?: PopoverPlacement;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'menu-sub',
		importStatement: "import { ZMenuSub, ZMenuSubTrigger, ZMenuSubContent } from '@zadmin/zui';",
		name: 'ZMenuSub',
		bindings: [{ description: '当前submenu打开状态。', name: 'open', type: 'boolean' }],
		dependencies: ['ZMenu', 'ZPopover', 'DismissableLayer', 'FocusScope'],
		events: [
			{
				description: '用户打开或关闭后调用。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		keyboard: [
			{ description: '按阅读方向进入submenu。', key: 'ArrowRight（RTL为ArrowLeft）' },
			{ description: '按反方向关闭并恢复父Item焦点。', key: 'ArrowLeft（RTL为ArrowRight）' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '受控或bindable打开状态。',
				name: 'open',
				type: 'boolean'
			},
			{ default: 'false', description: '非受控初始状态。', name: 'defaultOpen', type: 'boolean' },
			{
				default: 'RTL感知right-start/left-start',
				description: 'submenu首选位置。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{ default: '2', description: '父Item与submenu间距px。', name: 'gutter', type: 'number' }
		],
		since: 'unreleased',
		snippets: [{ description: 'SubTrigger与SubContent。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/menu/ZMenuSub.svelte',
		states: [],
		status: 'stable',
		summary: '复用Popover层、由父Menu协调同级唯一打开状态并支持RTL键盘方向的Submenu。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZPopover from '../popover/ZPopover.svelte';
	import { useZMenu } from './context.svelte.js';
	import {
		provideZMenuSub,
		type MenuSubFocusStrategy,
		type ZMenuSubContext
	} from './submenu-context.svelte.js';

	let {
		children,
		defaultOpen = false,
		gutter = 2,
		onOpenChange,
		open = $bindable(),
		placement
	}: ZMenuSubProps = $props();
	const zui = useZui();
	const parentMenu = useZMenu();
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	let focusStrategy = $state<MenuSubFocusStrategy>('first');
	let trigger = $state<HTMLElement | null>(null);
	let triggerValue = $state<SelectionKey>();
	const resolvedPlacement = $derived(
		placement ?? (zui.direction === 'rtl' ? 'left-start' : 'right-start')
	);
	const context: ZMenuSubContext = {
		close() {
			openState.setFromUser(false);
		},
		get focusStrategy() {
			return focusStrategy;
		},
		get open() {
			return openState.current;
		},
		openWith(strategy) {
			focusStrategy = strategy;
			openState.setFromUser(true);
		},
		setTrigger(value, next) {
			triggerValue = value;
			trigger = next;
		},
		get trigger() {
			return trigger;
		}
	};
	provideZMenuSub(context);

	$effect(() => {
		if (!openState.current || triggerValue === undefined) return;
		return parentMenu.claimSubmenu(triggerValue, () => openState.setFromUser(false));
	});
</script>

<ZPopover
	{gutter}
	modal={false}
	onOpenChange={(next) => openState.setFromUser(next)}
	open={openState.current}
	placement={resolvedPlacement}
>
	{@render children?.()}
</ZPopover>
