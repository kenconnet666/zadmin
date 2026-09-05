<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { PopoverPlacement } from '../popover/context.svelte.js';

	export interface ZTooltipProps {
		readonly children?: Snippet;
		readonly closeDelay?: number;
		readonly defaultOpen?: boolean;
		readonly delay?: number;
		readonly disabled?: boolean;
		readonly gutter?: number;
		readonly hoverable?: boolean;
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
			'ZTooltipGroup',
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
			{
				default: 'ZTooltipGroup delay或500',
				description: 'pointer首次打开延迟ms；keyboard focus始终即时。',
				name: 'delay',
				type: 'number'
			},
			{
				default: 'ZTooltipGroup closeDelay或100',
				description: 'Trigger/Content不再active后的关闭延迟ms。',
				name: 'closeDelay',
				type: 'number'
			},
			{
				default: 'false',
				description: '独立禁用Tooltip触发，不改变Trigger自身disabled状态。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'true',
				description: 'pointer进入非交互Content时保持打开，以满足hover内容可停留合同。',
				name: 'hoverable',
				type: 'boolean'
			},
			{
				default: "'top'",
				description: '首选浮层位置。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{ default: '6', description: 'Trigger与Tooltip间距。', name: 'gutter', type: 'number' }
		],
		since: '0.2.0',
		snippets: [{ description: 'Trigger与Content组合。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/tooltip/ZTooltip.svelte',
		states: [],
		status: 'stable',
		summary:
			'统一管理focus即时打开、group hover warmup/cooldown、Portal定位和严格非交互语义的Tooltip根组件。'
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
	import {
		provideZTooltip,
		type ZTooltipContext,
		useOptionalZTooltipGroup
	} from './context.svelte.js';

	let {
		children,
		closeDelay,
		defaultOpen = false,
		delay,
		disabled = false,
		gutter = 6,
		hoverable = true,
		onOpenChange,
		open = $bindable(),
		placement = 'top'
	}: ZTooltipProps = $props();
	const zui = useZui();
	const group = useOptionalZTooltipGroup();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'tooltip'));
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const resolvedCloseDelay = $derived(closeDelay ?? group?.closeDelay ?? 100);
	const resolvedDelay = $derived(delay ?? group?.delay ?? 500);
	const resolvedOpen = $derived(openState.current && !disabled);
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	let portalAnchor = $state<HTMLElement | null>(null);
	let trigger = $state<HTMLElement | null>(null);
	let triggerFocused = $state(false);
	let previousOpen = false;
	let timer: { readonly id: number; readonly view: Window } | undefined;
	let timerGeneration = 0;
	const clearTimer = () => {
		timerGeneration += 1;
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
		const generation = timerGeneration;
		const id = view.setTimeout(() => {
			if (generation !== timerGeneration) return;
			timer = undefined;
			callback();
		}, timeout);
		timer = { id, view };
	};
	const ownerWindow = (): Window | undefined =>
		(trigger ?? portalAnchor)?.ownerDocument.defaultView ?? undefined;
	const context: ZTooltipContext = {
		cancelClose() {
			clearTimer();
		},
		close(immediate = false) {
			clearTimer();
			if (immediate) openState.setFromUser(false);
			else schedule(() => openState.setFromUser(false), assertDelay(resolvedCloseDelay));
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
		get hoverable() {
			return hoverable;
		},
		get open() {
			return resolvedOpen;
		},
		openAfterDelay(immediate = false) {
			if (disabled) return;
			clearTimer();
			if (resolvedOpen) return;
			const timeout = immediate
				? 0
				: (group?.coordinator.openDelay(assertDelay(resolvedDelay)) ?? assertDelay(resolvedDelay));
			if (timeout === 0) openState.setFromUser(true);
			else
				schedule(() => {
					if (!disabled) openState.setFromUser(true);
				}, timeout);
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
			if (next && disabled) return;
			openState.setFromUser(next);
		},
		setTrigger(next) {
			clearTimer();
			trigger = next;
		},
		setTriggerFocused(next) {
			triggerFocused = next;
		},
		get trigger() {
			return trigger;
		},
		get triggerFocused() {
			return triggerFocused;
		}
	};
	provideZTooltip(context);
	$effect(() => {
		if (!disabled) return;
		clearTimer();
		if (openState.current) openState.setFromUser(false);
	});
	$effect(() => {
		const current = resolvedOpen;
		if (current && !previousOpen) {
			group?.coordinator.opened(
				idBase,
				() => context.close(true),
				() => context.setOpen(true),
				() => triggerFocused
			);
		} else if (!current && previousOpen) {
			clearTimer();
			group?.coordinator.closed(idBase, ownerWindow(), group.skipDelayDuration);
		}
		previousOpen = current;
	});
	onMount(() => reducedMotion.connect(portalAnchor?.ownerDocument.defaultView));
	onDestroy(() => {
		clearTimer();
		group?.coordinator.removed(idBase, ownerWindow(), group.skipDelayDuration);
	});
</script>

<span bind:this={portalAnchor} hidden aria-hidden="true" data-zui-portal-anchor></span>
{@render children?.()}
