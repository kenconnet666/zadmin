<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { PopoverPlacement as PopoverPlacementValue } from './context.svelte.js';

	export type PopoverPlacement = PopoverPlacementValue;

	export interface ZPopoverProps {
		readonly children?: Snippet;
		readonly defaultOpen?: boolean;
		readonly gutter?: number;
		readonly modal?: boolean;
		readonly onOpenChange?: (open: boolean) => void;
		open?: boolean;
		readonly placement?: PopoverPlacement;
	}

	export const zuiMetadata = {
		category: 'overlay',
		id: 'popover',
		importStatement: "import { ZPopover, ZPopoverTrigger, ZPopoverContent } from '@zadmin/zui';",
		name: 'ZPopover',
		bindings: [{ description: '当前打开状态。', name: 'open', type: 'boolean' }],
		dependencies: [
			'ZPopoverTrigger',
			'ZPopoverContent',
			'Portal',
			'Floating',
			'DismissableLayer',
			'FocusScope',
			'Presence'
		],
		events: [
			{
				description: '用户打开或关闭后调用一次。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		keyboard: [{ description: '关闭最顶层Popover并恢复焦点。', key: 'Escape' }],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前打开状态。',
				name: 'open',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '非受控初始打开状态。',
				name: 'defaultOpen',
				type: 'boolean'
			},
			{
				default: "'bottom'",
				description: '首选浮层位置。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{
				default: '8',
				description: 'Trigger与Content间距，单位px。',
				name: 'gutter',
				type: 'number'
			},
			{
				default: 'false',
				description: '启用焦点trap、scroll lock与inert others。',
				name: 'modal',
				type: 'boolean'
			}
		],
		since: '0.3.0',
		snippets: [{ description: 'Trigger与Content组合。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/popover/ZPopover.svelte',
		states: [],
		status: 'experimental',
		summary: '组合受控状态、浮层定位、Portal、dismiss与focus生命周期的Popover根组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { durationMilliseconds } from '../../../runtime/foundation/presence.svelte.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { provideZPopover, type ZPopoverContext } from './context.svelte.js';

	let {
		children,
		defaultOpen = false,
		gutter = 8,
		modal = false,
		onOpenChange,
		open = $bindable(),
		placement = 'bottom'
	}: ZPopoverProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'popover'));
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	let trigger = $state<HTMLElement | null>(null);
	const context: ZPopoverContext = {
		get contentId() {
			return `${idBase}-content`;
		},
		get exitDuration() {
			return zui.motion === 'reduced' ? 0 : durationMilliseconds(zui.theme.duration.fast);
		},
		get gutter() {
			return gutter;
		},
		get modal() {
			return modal;
		},
		get open() {
			return openState.current;
		},
		get placement() {
			return placement;
		},
		get portalTarget() {
			return zui.portalContainer ?? (typeof document === 'undefined' ? null : document);
		},
		get trigger() {
			return trigger;
		},
		get triggerId() {
			return `${idBase}-trigger`;
		},
		setOpen(next) {
			openState.setFromUser(next);
		},
		setTrigger(next) {
			trigger = next;
		}
	};
	provideZPopover(context);
</script>

{@render children?.()}
