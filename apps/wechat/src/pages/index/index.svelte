<script lang="ts">
	let count = $state(0);
</script>

<view class="page" data-testid="home-page">
	<text class="title">Svelte → Taro</text>
	<text class="status">runtime ready · count {count}</text>
	<button class="button" data-testid="counter" onclick={() => (count += 1)}>Increment</button>
</view>

<style>
	.page {
		display: flex;
		min-height: 100vh;
		padding: 48px 32px;
		box-sizing: border-box;
		flex-direction: column;
		gap: 24px;
	}

	.title {
		font-size: 24px;
		font-weight: 700;
	}

	.status {
		color: #475569;
	}

	.button {
		margin: 0;
		background: #2563eb;
		color: #ffffff;
	}
</style>
