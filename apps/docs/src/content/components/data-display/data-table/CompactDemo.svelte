<script lang="ts">
	import { ZDataTable, type SelectionKey } from '@zadmin/zui';

	const rows = [
		{ id: 'api', name: 'API', owner: '平台组' },
		{ id: 'docs', name: '文档站', owner: '体验组' },
		{ id: 'worker', name: 'Worker', owner: '数据组' }
	];
	const columns = [
		{
			id: 'name',
			header: '服务',
			accessor: (row: (typeof rows)[number]) => row.name,
			sortable: true
		},
		{ id: 'owner', header: '负责人', accessor: (row: (typeof rows)[number]) => row.owner }
	];
	let selectedKeys = $state<readonly SelectionKey[]>(['docs']);
</script>

<ZDataTable
	caption="服务负责人"
	{columns}
	density="compact"
	{rows}
	rowKey={(row) => row.id}
	selectionLabel={(row) => `选择${row.name}`}
	selectionMode="single"
	bind:selectedKeys
/>
