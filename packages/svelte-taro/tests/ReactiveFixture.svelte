<script lang="ts">
	let count = $state(0);
	let items = $state([1, 2]);
</script>

<view data-testid="root">
	<text>count:{count}</text>
	<button onclick={() => (count += 1)}>increment</button>
	{#if count > 0}<text>active</text>{/if}
	{#each items as item (item)}<text>item:{item}</text>{/each}
</view>
