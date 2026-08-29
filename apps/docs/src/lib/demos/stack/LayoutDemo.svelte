<script lang="ts">
	import { ZBox, ZStack, type ZStackDirection } from '@zadmin/zui';

	let direction = $state<ZStackDirection>('row');
</script>

<label class="control">
	<span>方向</span>
	<select bind:value={direction}>
		<option value="row">row</option>
		<option value="column">column</option>
		<option value="row-reverse">row-reverse</option>
		<option value="column-reverse">column-reverse</option>
	</select>
</label>

<ZStack {direction} gap="small" wrap>
	{#each ['Alpha', 'Beta', 'Gamma'] as item (item)}
		<ZBox class="item">{item}</ZBox>
	{/each}
</ZStack>

<style>
	.control {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		font-weight: 700;
	}

	select {
		padding: 0.45rem 0.65rem;
		border: 1px solid var(--docs-border);
		border-radius: 0.55rem;
		background: var(--docs-surface);
		color: inherit;
	}

	:global(.item) {
		min-width: 5.5rem;
		padding: 0.75rem 1rem;
		border: 1px solid var(--docs-primary-border);
		border-radius: 0.65rem;
		background: var(--docs-primary-soft);
		color: var(--docs-primary-strong);
		text-align: center;
	}
</style>
