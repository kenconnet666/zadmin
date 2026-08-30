<script lang="ts">
	import { ZTable, ZVirtualList } from '../src/entrypoints/index.js';
	const rows = Array.from({ length: 1000 }, (_, index) => ({
		id: `row-${index}`,
		label: `Row ${index}`
	}));
</script>

<ZTable caption="Deployments" striped data-testid="table">
	{#snippet header()}<tr><th scope="col">Name</th><th scope="col">Status</th></tr>{/snippet}
	<tr><th scope="row">Docs</th><td>Ready</td></tr>
	<tr><th scope="row">Admin</th><td>Building</td></tr>
</ZTable>

<ZVirtualList
	ariaLabel="Large deployment list"
	items={rows}
	itemKey={(row) => row.id}
	itemSize={40}
	height={120}
	data-testid="virtual-list"
>
	{#snippet item(row, index)}<span>{index}: {row.label}</span>{/snippet}
</ZVirtualList>
