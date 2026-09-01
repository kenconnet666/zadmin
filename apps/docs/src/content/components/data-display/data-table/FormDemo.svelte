<script lang="ts">
	import {
		ZButton,
		ZDataTable,
		ZStack,
		ZText,
		type DataSortDescriptor,
		type DataTableColumn,
		type ZDataTableController
	} from '@zadmin/zui';

	interface DeploymentRow {
		duration: number;
		id: string;
		name: string;
		status: string;
	}

	let rows = $state<readonly DeploymentRow[]>(
		Array.from({ length: 1000 }, (_, index) => ({
			id: `deploy-${index}`,
			name: `部署 ${index + 1}`,
			duration: (index * 17) % 300,
			status: index % 3 === 0 ? '正常' : '待验证'
		}))
	);
	const columns = [
		{
			id: 'name',
			header: '部署',
			accessor: (row: DeploymentRow) => row.name,
			sortable: true,
			width: 180
		},
		{
			id: 'duration',
			header: '耗时(ms)',
			accessor: (row: DeploymentRow) => row.duration,
			sortable: true,
			width: 140
		},
		{
			id: 'status',
			header: '状态',
			accessor: (row: DeploymentRow) => row.status,
			width: 140
		}
	] satisfies readonly DataTableColumn<DeploymentRow>[];
	let controller = $state<ZDataTableController<string> | null>(null);
	let selectedKeys = $state<readonly string[]>([]);
	let sort = $state<DataSortDescriptor>();
	let prepends = $state(0);

	function prepend(): void {
		prepends += 1;
		rows = [
			{
				id: `urgent-${prepends}`,
				name: `紧急部署 ${prepends}`,
				duration: 8,
				status: '正常'
			},
			...rows
		];
	}
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton
			size="small"
			variant="secondary"
			onclick={() => controller?.scrollToRow('deploy-900', 'center')}>滚动到第901行</ZButton
		>
		<ZButton
			size="small"
			variant="secondary"
			onclick={() => controller?.focusRow('deploy-900', 'selection')}>定位并聚焦选择框</ZButton
		>
		<ZButton size="small" variant="secondary" onclick={prepend}>在顶部插入一行</ZButton>
	</ZStack>
	<ZText aria-live="polite" tone="muted">
		DOM窗口 = {controller?.range
			? `${controller.range.startIndex}–${controller.range.endIndex}`
			: '准备中'} · selected = {selectedKeys.join(', ') || 'none'} · sort = {sort
			? `${sort.columnId}/${sort.direction}`
			: 'none'}
	</ZText>
	<ZDataTable
		caption="一千条部署记录"
		{columns}
		{rows}
		rowKey={(row) => row.id}
		selectionMode="multiple"
		bind:controller
		bind:selectedKeys
		bind:sort
		virtualized
		height={308}
		rowHeight={44}
		ssrViewportSize={220}
		striped
		selectionLabel={(row) => `选择 ${row.name}`}
		data-testid="docs-data-table"
	/>
</ZStack>
