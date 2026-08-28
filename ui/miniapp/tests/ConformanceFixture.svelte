<script lang="ts">
	import { setContext } from 'svelte';

	import ConformanceChild from './ConformanceChild.svelte';
	import ConformanceError from './ConformanceError.svelte';

	interface Props {
		onCleanup(value: number): void;
		onEffect(value: number): void;
		onLifecycle(value: 'destroy' | 'mount' | 'mount-cleanup'): void;
	}

	let { onCleanup, onEffect, onLifecycle }: Props = $props();
	let count = $state(1);
	let bound = $state(2);
	let shouldThrow = $state(false);
	let boundaryError = $state('');
	let awaited = $state(Promise.resolve('ready'));
	const doubled = $derived(count * 2);
	setContext('conformance-label', 'context');

	function handleBoundary(error: unknown): void {
		boundaryError = error instanceof Error ? error.message : 'unknown';
	}
</script>

<view class="fixture" class:active={count > 1} style:opacity={count > 0 ? 1 : 0.5}>
	<text>derived:{doubled}</text>
	<button id="increment" onclick={() => (count += 1)}>increment</button>
	<button id="failure" onclick={() => (shouldThrow = true)}>failure</button>
	<ConformanceChild {onCleanup} {onEffect} {onLifecycle} value={count} bind:bound>
		{#snippet children(label)}<text>{label}</text>{/snippet}
	</ConformanceChild>
	{#key count}<text>key:{count}</text>{/key}
	{#each [count, count + 1] as item (item)}<text>item:{item}</text>{/each}
	{#await awaited}<text>pending</text>{:then value}<text>await:{value}</text>{/await}
	<svelte:boundary onerror={handleBoundary}>
		<ConformanceError {shouldThrow} />
	</svelte:boundary>
	{#if boundaryError}<text>boundary:{boundaryError}</text>{/if}
</view>
