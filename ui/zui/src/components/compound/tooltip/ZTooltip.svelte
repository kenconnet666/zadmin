<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { PopoverPlacement } from '../popover/context.svelte.js';

	export interface ZTooltipProps {
		readonly children?: Snippet;
		readonly closeDelay?: number;
		readonly defaultOpen?: boolean;
		readonly delay?: number;
		readonly gutter?: number;
		readonly onOpenChange?: (open: boolean) => void;
		open?: boolean;
		readonly placement?: PopoverPlacement;
	}

	export const zuiMetadata = {
		category: 'overlay',
		id: 'tooltip',
		importStatement: "import { ZTooltip, ZTooltipTrigger, ZTooltipContent } from '@zadmin/zui';",
		name: 'ZTooltip',
		bindings: [{ description: '当前打开状态。', name: 'open', type: 'boolean' }],
		dependencies: [
			'ZTooltipTrigger',
			'ZTooltipContent',
			'Portal',
			'Floating',
			'LayerStack',
			'Presence'
		],
		events: [
			{
				description: '延迟或用户交互改变打开状态后调用一次。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		keyboard: [{ description: '关闭顶层Tooltip。', key: 'Escape' }],
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
			{ default: '500', description: '首次打开延迟，单位ms。', name: 'delay', type: 'number' },
			{ default: '100', description: '关闭延迟，单位ms。', name: 'closeDelay', type: 'number' },
			{
				default: "'top'",
				description: '首选浮层位置。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{ default: '6', description: 'Trigger与Tooltip间距。', name: 'gutter', type: 'number' }
		],
		since: 'unreleased',
		snippets: [{ description: 'Trigger与Content组合。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/tooltip/ZTooltip.svelte',
		states: [],
		status: 'experimental',
		summary: '统一管理hover/focus延迟、Portal定位和非交互语义的Tooltip根组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { ReducedMotionState } from '../../../runtime/foundation/motion.svelte.js';
	import { durationMilliseconds } from '../../../runtime/foundation/presence.svelte.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { resolvePortalTarget } from '../../../runtime/layer/portal.js';
	import { provideZTooltip, type ZTooltipContext } from './context.svelte.js';

	let {
		children,
		closeDelay = 100,
		defaultOpen = false,
		delay = 500,
		gutter = 6,
		onOpenChange,
		open = $bindable(),
		placement = 'top'
	}: ZTooltipProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'tooltip'));
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	let portalAnchor = $state<HTMLElement | null>(null);
	let trigger = $state<HTMLButtonElement | null>(null);
	let timer: { readonly id: number; readonly view: Window } | undefined;
	const clearTimer = () => {
		if (timer) timer.view.clearTimeout(timer.id);
		timer = undefined;
	};
	const assertDelay = (value: number) => {
		if (!Number.isFinite(value) || value < 0)
			throw new TypeError('Tooltip delays must be non-negative.');
		return value;
	};
	const schedule = (callback: () => void, timeout: number): void => {
		const view = (trigger ?? portalAnchor)?.ownerDocument.defaultView;
		if (!view) return;
		const id = view.setTimeout(() => {
			timer = undefined;
			callback();
		}, timeout);
		timer = { id, view };
	};
	const context: ZTooltipContext = {
		cancelClose() {
			clearTimer();
		},
		close(immediate = false) {
			clearTimer();
			if (immediate) openState.setFromUser(false);
			else schedule(() => openState.setFromUser(false), assertDelay(closeDelay));
		},
		get contentId() {
			return `${idBase}-content`;
		},
		get exitDuration() {
			return reducedMotion.current ? 0 : durationMilliseconds(zui.theme.duration.fast);
		},
		get gutter() {
			return gutter;
		},
		get open() {
			return openState.current;
		},
		openAfterDelay() {
			clearTimer();
			schedule(() => openState.setFromUser(true), assertDelay(delay));
		},
		get placement() {
			return placement;
		},
		get portalTarget() {
			return resolvePortalTarget(trigger ?? portalAnchor, zui.portalContainer);
		},
		get reducedMotion() {
			return reducedMotion.current;
		},
		setOpen(next) {
			clearTimer();
			openState.setFromUser(next);
		},
		setTrigger(next) {
			trigger = next;
		},
		get trigger() {
			return trigger;
		}
	};
	provideZTooltip(context);
	onMount(() => reducedMotion.connect(portalAnchor?.ownerDocument.defaultView));
	onDestroy(clearTimer);
</script>

<span bind:this={portalAnchor} hidden aria-hidden="true" data-zui-portal-anchor></span>
{@render children?.()}
