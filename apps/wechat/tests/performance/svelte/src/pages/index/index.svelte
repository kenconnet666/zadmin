<script lang="ts">
	let items = $state(Array.from({ length: 200 }, (_, index) => index));

	function rotate(): void {
		items = [...items.slice(1), items[0]];
	}
</script>

<view>
	<button onclick={rotate}>rotate</button>
	{#each items as item (item)}<text>{item}</text>{/each}
</view>
