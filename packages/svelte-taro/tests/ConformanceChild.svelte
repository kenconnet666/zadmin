<script lang="ts">
	import { getContext, onDestroy, onMount, type Snippet } from 'svelte';

	interface Props {
		bound?: number;
		children?: Snippet<[string]>;
		onCleanup(value: number): void;
		onEffect(value: number): void;
		onLifecycle(value: 'destroy' | 'mount' | 'mount-cleanup'): void;
		value: number;
	}

	let { bound = $bindable(0), children, onCleanup, onEffect, onLifecycle, value }: Props = $props();
	const doubled = $derived(value * 2);
	const label = getContext<string>('conformance-label');

	onMount(() => {
		onLifecycle('mount');
		return () => onLifecycle('mount-cleanup');
	});
	onDestroy(() => onLifecycle('destroy'));
	$effect(() => {
		onEffect(value);
		return () => onCleanup(value);
	});
</script>

<view class:active={value > 0} style:opacity={value > 0 ? 1 : 0.5}>
	<text>{label}:{doubled}:bound:{bound}</text>
	<button id="bound" onclick={() => (bound += 1)}>bindable</button>
	{@render children?.(`snippet:${value}`)}
</view>
