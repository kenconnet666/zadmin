<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import { durationMilliseconds } from '../../runtime/foundation/presence.svelte.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import type { ToastQueue, ToastRecord } from '../../runtime/toast.svelte.js';
	import ZToast from './ZToast.svelte';

	let { item, queue }: { item: ToastRecord; queue: ToastQueue } = $props();
	const zui = useZui();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	let ref = $state<HTMLElement | null>(null);
	let animation: Animation | undefined;
	const id = $derived(item.id);
	const phase = $derived(item.phase);
	const reduced = $derived(reducedMotion.current);
	const motionDuration = $derived(durationMilliseconds(zui.theme.duration.normal));

	onMount(() => reducedMotion.connect());
	onDestroy(() => animation?.cancel());

	$effect(() => {
		const element = ref;
		const currentPhase = phase;
		const currentId = id;
		const duration = motionDuration;
		const shouldReduce = reduced;
		if (!element) return;
		animation?.cancel();
		animation = undefined;
		if (shouldReduce) {
			if (currentPhase === 'exiting') {
				queueMicrotask(() => queue.completeExit(currentId));
			}
			return;
		}
		const visibleFrame = { opacity: 1, transform: 'translateY(0) scale(1)' };
		const hiddenFrame = { opacity: 0, transform: 'translateY(-0.5rem) scale(0.98)' };
		const next = element.animate(
			currentPhase === 'exiting' ? [visibleFrame, hiddenFrame] : [hiddenFrame, visibleFrame],
			{
				duration,
				easing: 'ease',
				fill: currentPhase === 'exiting' ? 'forwards' : 'none'
			}
		);
		animation = next;
		if (currentPhase === 'exiting') {
			void next.finished
				.then(() => queue.completeExit(currentId))
				.catch(() => undefined);
		}
		return () => {
			if (animation !== next) return;
			next.cancel();
			animation = undefined;
		};
	});

	function runAction(): void {
		try {
			item.onAction?.(item.id);
		} finally {
			queue.dismiss(item.id, 'action');
		}
	}
</script>

<ZToast
	bind:ref
	title={item.title}
	description={item.description}
	tone={item.tone}
	priority={item.priority}
	actionLabel={item.actionLabel}
	dismissible={item.dismissible}
	dismissLabel={item.dismissLabel ?? `Dismiss ${item.title}`}
	inert={item.phase === 'exiting' || undefined}
	data-phase={item.phase}
	data-presence={item.phase === 'exiting' ? 'exiting' : 'entered'}
	data-reduced-motion={reduced || undefined}
	onAction={runAction}
	onDismiss={() => queue.dismiss(item.id, 'close')}
	onPauseChange={(reason, paused) =>
		paused ? queue.pause(item.id, reason) : queue.resume(item.id, reason)}
/>
