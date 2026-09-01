<script lang="ts">
	import {
		ZDataTable,
		ZStack,
		ZText,
		type DataSortDescriptor,
		type DataTableColumn,
		type SelectionKey
	} from '@zadmin/zui';

	interface DeploymentRow {
		id: string;
		name: string;
		owner: string;
		region: string;
	}

	const rows: readonly DeploymentRow[] = [
		{ id: 'api', name: 'API Gateway', owner: '平台组', region: '华东' },
		{ id: 'docs', name: 'Docs', owner: '体验组', region: '华北' },
		{ id: 'worker', name: 'Async Worker', owner: '数据组', region: '华南' },
		{ id: 'console', name: 'Admin Console', owner: '体验组', region: '华东' }
	];
	const columns = [
		{ id: 'name', header: '服务', accessor: (row: DeploymentRow) => row.name, sortable: true },
		{ id: 'owner', header: '负责人', accessor: (row: DeploymentRow) => row.owner, sortable: true },
		{ id: 'region', header: '区域', accessor: (row: DeploymentRow) => row.region }
	] satisfies readonly DataTableColumn<DeploymentRow>[];
	let selectedKeys = $state<readonly SelectionKey[]>(['docs']);
	let sort = $state<DataSortDescriptor>();
</script>

<ZStack gap="medium">
	<ZText aria-live="polite" tone="muted">
		selected = {selectedKeys.join(', ') || 'none'} · sort = {sort
			? `${sort.columnId}/${sort.direction}`
			: 'none'}
	</ZText>
	<ZDataTable
		caption="服务部署"
		{columns}
		{rows}
		rowKey={(row) => row.id}
		selectAllLabel="选择全部服务"
		selectionLabel={(row) => `选择 ${row.name}`}
		selectionMode="multiple"
		bind:selectedKeys
		bind:sort
		striped
	/>
</ZStack>
