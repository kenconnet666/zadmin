<script lang="ts">
	import { ZDataTable, ZText, type DataSortDescriptor, type SelectionKey } from '@zadmin/zui';
	const rows = Array.from({ length: 1000 }, (_, index) => ({
		id: `deploy-${index}`,
		name: `部署 ${index + 1}`,
		duration: (index * 17) % 300,
		status: index % 3 === 0 ? '正常' : '待验证'
	}));
	const columns = [
		{
			id: 'name',
			header: '部署',
			accessor: (row: (typeof rows)[number]) => row.name,
			sortable: true
		},
		{
			id: 'duration',
			header: '耗时(ms)',
			accessor: (row: (typeof rows)[number]) => row.duration,
			sortable: true
		},
		{ id: 'status', header: '状态', accessor: (row: (typeof rows)[number]) => row.status }
	];
	let selectedKeys = $state<readonly SelectionKey[]>([]);
	let sort = $state<DataSortDescriptor>();
</script>

<ZText tone="muted"
	>selected = {selectedKeys.join(',') || 'none'} · sort = {sort
		? `${sort.columnId}/${sort.direction}`
		: 'none'}</ZText
>
<ZDataTable
	caption="一千条部署记录"
	{columns}
	{rows}
	rowKey={(row) => row.id}
	selectionMode="multiple"
	bind:selectedKeys
	bind:sort
	virtualized
	height={308}
	rowHeight={44}
	striped
	selectionLabel={(row) => `选择 ${row.name}`}
	data-testid="docs-data-table"
/>
