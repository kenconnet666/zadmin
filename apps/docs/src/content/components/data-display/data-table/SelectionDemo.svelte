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
		id: SelectionKey;
		name: string;
		owner: string;
		region: string;
	}

	const rows: readonly DeploymentRow[] = [
		{ id: 1, name: 'API Gateway', owner: '平台组', region: '华东' },
		{ id: '1', name: 'Docs', owner: '体验组', region: '华北' },
		{ id: 'worker', name: 'Async Worker', owner: '数据组', region: '华南' },
		{ id: 'console', name: 'Admin Console', owner: '体验组', region: '华东' }
	];
	const columns = [
		{ id: 'name', header: '服务', accessor: (row: DeploymentRow) => row.name, sortable: true },
		{ id: 'owner', header: '负责人', accessor: (row: DeploymentRow) => row.owner, sortable: true },
		{ id: 'region', header: '区域', accessor: (row: DeploymentRow) => row.region }
	] satisfies readonly DataTableColumn<DeploymentRow>[];
	const defaultSort = {
		columnId: 'name',
		direction: 'ascending'
	} as const satisfies DataSortDescriptor;
	let selectedKeys = $state<readonly SelectionKey[]>([1, '1']);
	let observedSort = $state<DataSortDescriptor | undefined>(defaultSort);
</script>

<ZStack gap="medium">
	<ZText aria-live="polite" tone="muted">
		selected = {selectedKeys.map((key) => `${typeof key}:${key}`).join(', ') || 'none'} · sort =
		{observedSort ? `${observedSort.columnId}/${observedSort.direction}` : 'none'}
	</ZText>
	<ZDataTable
		caption="服务部署"
		{columns}
		{defaultSort}
		{rows}
		rowKey={(row) => row.id}
		selectAllLabel="选择全部服务"
		selectionLabel={(row) => `选择 ${row.name}`}
		selectionMode="multiple"
		bind:selectedKeys
		onSortChange={(next) => (observedSort = next)}
		striped
	/>
</ZStack>
