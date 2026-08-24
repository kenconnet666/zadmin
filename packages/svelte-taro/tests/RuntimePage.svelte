<script lang="ts">
	let count = $state(0);
</script>

<view><text>runtime:{count}</text><button onclick={() => (count += 1)}>add</button></view>
