<script lang="ts">
	import {
		ZDataTable,
		ZTable,
		ZVirtualList,
		type DataSortDescriptor,
		type SelectionKey
	} from '../src/entrypoints/index.js';
	const rows = Array.from({ length: 1000 }, (_, index) => ({
		id: `row-${index}`,
		label: `Row ${index}`
	}));
	const columns = [
		{
			accessor: (row: (typeof rows)[number]) => Number(row.id.slice(4)),
			header: 'Index',
			id: 'index',
			sortable: true
		},
		{
			accessor: (row: (typeof rows)[number]) => row.label,
			header: 'Label',
			id: 'label',
			sortable: true
		}
	];
	let selectedKeys = $state<readonly SelectionKey[]>(['row-2']);
	let sort = $state<DataSortDescriptor>();
	let virtualRange = $state('none');
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
	initialIndex={50}
	onRangeChange={(range) => (virtualRange = `${range.startIndex}:${range.endIndex}`)}
	data-testid="virtual-list"
>
	{#snippet item(row, index)}<span>{index}: {row.label}</span>{/snippet}
</ZVirtualList>
<output data-testid="virtual-list-output">{virtualRange}</output>

<ZDataTable
	caption="Large deployment table"
	{columns}
	{rows}
	rowKey={(row) => row.id}
	virtualized
	height={132}
	rowHeight={44}
	selectionMode="multiple"
	bind:selectedKeys
	bind:sort
	data-testid="data-table"
/>
<output data-testid="data-table-output"
	>{selectedKeys.join(',') || 'none'}:{sort ? `${sort.columnId}-${sort.direction}` : 'none'}</output
>
