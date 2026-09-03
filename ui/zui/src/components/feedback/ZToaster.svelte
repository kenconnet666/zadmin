<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ToastQueue } from '../../runtime/toast.svelte.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type ToasterPlacement = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start';
	export interface ZToasterProps extends HTMLAttributes<HTMLElement> {
		readonly label?: string;
		readonly maxVisible?: number;
		readonly placement?: ToasterPlacement;
		readonly queue: ToastQueue;
		ref?: HTMLElement | null;
	}
	export const zuiMetadata = {
		category: 'feedback',
		id: 'toaster',
		importStatement: "import { ZToaster, createToastQueue } from '@zadmin/zui';",
		name: 'ZToaster',
		bindings: [{ description: '真实通知region引用。', name: 'ref', type: 'HTMLElement | null' }],
		dependencies: [
			'ToastQueue',
			'ZToast',
			'Portal',
			'Presence',
			'ReducedMotionState',
			'scoped polite/assertive announcer'
		],
		events: [],
		keyboard: [{ description: '进入Toast操作；焦点内暂停超时。', key: 'Tab' }],
		parts: [
			{ description: 'Toast堆栈。', name: 'viewport' },
			{ description: '集中polite live region。', name: 'polite-announcer' },
			{ description: '顺序节流assertive live region。', name: 'assertive-announcer' }
		],
		props: [
			{
				default: '必填',
				description: '显式队列实例。',
				name: 'queue',
				required: true,
				type: 'ToastQueue'
			},
			{
				default: '3',
				description:
					'同时进入viewport的最大数量；其余消息按FIFO等待且不开始计时，动态缩小时最新项重新排队。',
				name: 'maxVisible',
				type: 'number'
			},
			{
				default: "'top-end'",
				description: '逻辑方向位置。',
				name: 'placement',
				type: 'ToasterPlacement'
			},
			{
				default: 'localePack.feedback.notifications',
				description: '通知viewport的可访问名称；显式值优先于Provider locale。',
				name: 'label',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: 'Portal后的真实通知region引用。',
				name: 'ref',
				type: 'HTMLElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/feedback/ZToaster.svelte',
		states: [
			{
				description: '逻辑视口位置。',
				name: 'data-placement',
				values: ['bottom-end', 'bottom-start', 'top-end', 'top-start']
			},
			{ description: '等待入场的Toast数量。', name: 'data-queued', values: ['0', '1', 'n'] },
			{
				description: '集中公告器的优先级。',
				name: 'data-announcer',
				values: ['polite', 'assertive']
			}
		],
		status: 'stable',
		summary: 'Portal消费显式ToastQueue，以FIFO入场、Presence退出和多原因暂停管理通知生命周期。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._medium;
			s.maxWidth.rem(24);
			s.position.fixed;
			s.width.raw('calc(100% - 2rem)');
			s.zIndex._toast;
		},
		variants: {
			placement: {
				'bottom-end': (s) => {
					s.insetBlockEnd._large;
					s.insetInlineEnd._large;
				},
				'bottom-start': (s) => {
					s.insetBlockEnd._large;
					s.insetInlineStart._large;
				},
				'top-end': (s) => {
					s.insetBlockStart._large;
					s.insetInlineEnd._large;
				},
				'top-start': (s) => {
					s.insetBlockStart._large;
					s.insetInlineStart._large;
				}
			}
		},
		defaultVariants: { placement: 'top-end' }
	});
	registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	/* eslint-disable svelte/prefer-svelte-reactivity -- Announcement de-duplication and timer ownership are imperative lifecycle bookkeeping. */
	import { onDestroy, onMount, untrack } from 'svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { portal, resolvePortalTarget } from '../../runtime/layer/portal.js';
	import type { ToastRecord } from '../../runtime/toast.svelte.js';
	import ZVisuallyHidden from '../gene/ZVisuallyHidden.svelte';
	import QueuedToast from './QueuedToast.svelte';

	const ASSERTIVE_ANNOUNCEMENT_INTERVAL = 1000;
	let {
		class: className,
		label,
		maxVisible = 3,
		placement = 'top-end',
		queue,
		ref = $bindable(null),
		style,
		...rest
	}: ZToasterProps = $props();
	const zui = useZui();
	const resolvedLabel = $derived(label ?? zui.localePack.feedback.notifications);
	let mounted = $state(false);
	let portalAnchor = $state<HTMLElement | null>(null);
	const limit = $derived.by(() => {
		if (!Number.isInteger(maxVisible) || maxVisible < 1) {
			throw new TypeError('ZToaster maxVisible must be a positive integer.');
		}
		return maxVisible;
	});
	const presented = $derived(queue.presentedItems);
	// Cap the SSR/first-render view before the mounted effect synchronizes Queue phases.
	const visible = $derived(presented.slice(0, limit));
	const queuedCount = $derived(queue.queuedCount + presented.length - visible.length);
	const rootClass = $derived(zui.recipe(recipe, { placement }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const portalTarget = $derived(resolvePortalTarget(portalAnchor, zui.portalContainer));
	let announcedQueue: ToastQueue | undefined;
	let announcedInstances = new Set<number>();
	let scheduledInstances = new Set<number>();
	let assertivePending: number[] = [];
	let assertiveTimer: number | undefined;
	let assertiveTimerWindow: Window | undefined;
	let announcerWindow: Window | undefined;
	let lastAssertiveAt = Number.NEGATIVE_INFINITY;
	let politeAnnouncement = $state('');
	let politeRevision = $state(0);
	let assertiveAnnouncement = $state('');
	let assertiveRevision = $state(0);

	function announcementText(item: ToastRecord): string {
		return [item.title, item.description].filter(Boolean).join('. ');
	}
	function clearAssertiveTimer(): void {
		if (assertiveTimer !== undefined) assertiveTimerWindow?.clearTimeout(assertiveTimer);
		assertiveTimer = undefined;
		assertiveTimerWindow = undefined;
	}
	function resetAnnouncer(nextQueue = queue): void {
		clearAssertiveTimer();
		announcedQueue = nextQueue;
		announcedInstances = new Set();
		scheduledInstances = new Set();
		assertivePending = [];
		lastAssertiveAt = Number.NEGATIVE_INFINITY;
	}
	function currentVisibleInstance(instance: number): ToastRecord | undefined {
		return queue.items.find((item) => item.instance === instance && item.phase === 'visible');
	}
	function publishPolite(items: readonly ToastRecord[]): void {
		if (items.length === 0) return;
		for (const item of items) announcedInstances.add(item.instance);
		politeAnnouncement = items.map(announcementText).join('. ');
		politeRevision += 1;
	}
	function drainAssertive(): void {
		if (assertiveTimer !== undefined || assertivePending.length === 0) return;
		const ownerWindow = ref?.ownerDocument.defaultView;
		if (!ownerWindow) return;
		const elapsed = ownerWindow.performance.now() - lastAssertiveAt;
		const delay = Math.max(0, ASSERTIVE_ANNOUNCEMENT_INTERVAL - elapsed);
		if (delay > 0) {
			assertiveTimerWindow = ownerWindow;
			assertiveTimer = ownerWindow.setTimeout(() => {
				assertiveTimer = undefined;
				assertiveTimerWindow = undefined;
				drainAssertive();
			}, delay);
			return;
		}
		let item: ToastRecord | undefined;
		while (assertivePending.length > 0 && !item) {
			const instance = assertivePending.shift();
			if (instance === undefined) continue;
			scheduledInstances.delete(instance);
			const candidate = currentVisibleInstance(instance);
			if (candidate?.priority === 'polite') {
				publishPolite([candidate]);
				continue;
			}
			item = candidate;
		}
		if (!item) return;
		announcedInstances.add(item.instance);
		assertiveAnnouncement = announcementText(item);
		assertiveRevision += 1;
		lastAssertiveAt = ownerWindow.performance.now();
		if (assertivePending.length > 0) drainAssertive();
	}
	onMount(() => {
		mounted = true;
		return () => {
			mounted = false;
		};
	});
	$effect(() => {
		const currentQueue = queue;
		const currentLimit = limit;
		untrack(() => currentQueue.setMaxVisible(currentLimit));
		if (!mounted) return;
		const ownerDocument = ref?.ownerDocument;
		const disconnectViewport = untrack(() =>
			currentQueue.connectViewport(currentLimit, ownerDocument?.defaultView ?? undefined)
		);
		const disconnectVisibility = untrack(() => currentQueue.connectVisibility(ownerDocument));
		return () => {
			disconnectVisibility();
			disconnectViewport();
		};
	});
	$effect(() => {
		const currentQueue = queue;
		const currentItems = currentQueue.items;
		if (announcedQueue !== currentQueue) resetAnnouncer(currentQueue);
		const activeInstances = new Set(currentItems.map((item) => item.instance));
		for (const instance of announcedInstances) {
			if (!activeInstances.has(instance)) announcedInstances.delete(instance);
		}
		for (const instance of scheduledInstances) {
			if (!activeInstances.has(instance)) scheduledInstances.delete(instance);
		}
		assertivePending = assertivePending.filter((instance) => activeInstances.has(instance));
		if (assertivePending.length === 0) clearAssertiveTimer();
		const newlyVisible = currentItems.filter(
			(item) =>
				item.phase === 'visible' &&
				!announcedInstances.has(item.instance) &&
				!scheduledInstances.has(item.instance)
		);
		const polite = newlyVisible.filter((item) => item.priority === 'polite');
		publishPolite(polite);
		for (const item of newlyVisible) {
			if (item.priority !== 'assertive') continue;
			scheduledInstances.add(item.instance);
			assertivePending.push(item.instance);
		}
		untrack(drainAssertive);
	});
	$effect(() => {
		const ownerWindow = ref?.ownerDocument.defaultView ?? undefined;
		if (announcerWindow !== ownerWindow) {
			clearAssertiveTimer();
			announcerWindow = ownerWindow;
			lastAssertiveAt = Number.NEGATIVE_INFINITY;
		}
		untrack(drainAssertive);
	});
	onDestroy(clearAssertiveTimer);
</script>

<span bind:this={portalAnchor} hidden aria-hidden="true" data-zui-portal-anchor></span>
<section
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	use:portal={{ target: portalTarget }}
	aria-label={resolvedLabel}
	data-slot="viewport"
	data-placement={placement}
	data-queued={queuedCount}
>
	<ZVisuallyHidden
		aria-atomic="true"
		aria-live="polite"
		data-announcer="polite"
		data-slot="polite-announcer"
		role="status"
	>
		{#key politeRevision}{politeAnnouncement}{/key}
	</ZVisuallyHidden>
	<ZVisuallyHidden
		aria-atomic="true"
		aria-live="assertive"
		data-announcer="assertive"
		data-slot="assertive-announcer"
		role="alert"
	>
		{#key assertiveRevision}{assertiveAnnouncement}{/key}
	</ZVisuallyHidden>
	{#each visible as item (item.id)}<QueuedToast {item} {queue} />{/each}
</section>
