<script lang="ts">
	import {
		stableSortRows,
		ZDataTable,
		ZInput,
		ZPagination,
		ZStack,
		ZText,
		type DataSortDescriptor,
		type DataTableColumn
	} from '@zadmin/zui';

	interface ServiceRow {
		id: string;
		name: string;
		owner: string;
		region: string;
	}

	const allRows: readonly ServiceRow[] = [
		{ id: 'api', name: 'API Gateway', owner: '平台组', region: '华东' },
		{ id: 'docs', name: 'Docs', owner: '体验组', region: '华北' },
		{ id: 'worker', name: 'Async Worker', owner: '数据组', region: '华南' },
		{ id: 'console', name: 'Admin Console', owner: '体验组', region: '华东' },
		{ id: 'search', name: 'Search', owner: '数据组', region: '华北' },
		{ id: 'billing', name: 'Billing', owner: '平台组', region: '华南' },
		{ id: 'audit', name: 'Audit Log', owner: '安全组', region: '华东' },
		{ id: 'identity', name: 'Identity', owner: '安全组', region: '华北' }
	];
	const columns = [
		{ id: 'name', header: '服务', accessor: (row: ServiceRow) => row.name, sortable: true },
		{ id: 'owner', header: '负责人', accessor: (row: ServiceRow) => row.owner, sortable: true },
		{ id: 'region', header: '区域', accessor: (row: ServiceRow) => row.region }
	] satisfies readonly DataTableColumn<ServiceRow>[];
	const pageSize = 3;
	let filter = $state('');
	let page = $state(1);
	let sort = $state<DataSortDescriptor | undefined>({
		columnId: 'name',
		direction: 'ascending'
	});
	const filteredRows = $derived(
		allRows.filter((row) =>
			`${row.name} ${row.owner} ${row.region}`
				.toLocaleLowerCase('zh-CN')
				.includes(filter.trim().toLocaleLowerCase('zh-CN'))
		)
	);
	const sortedRows = $derived.by(() => {
		const descriptor = sort;
		if (!descriptor) return filteredRows;
		const column = columns.find(({ id }) => id === descriptor.columnId);
		return column
			? stableSortRows(filteredRows, {
					accessor: column.accessor,
					direction: descriptor.direction,
					locale: 'zh-CN'
				})
			: filteredRows;
	});
	const totalPages = $derived(Math.max(1, Math.ceil(sortedRows.length / pageSize)));
	const pageRows = $derived(sortedRows.slice((page - 1) * pageSize, page * pageSize));

	function setFilter(next: string): void {
		filter = next;
		page = 1;
	}

	function setSort(next: DataSortDescriptor | undefined): void {
		sort = next;
		page = 1;
	}
</script>

<ZStack gap="medium">
	<ZInput
		aria-label="筛选服务"
		placeholder="按服务、负责人或区域筛选"
		value={filter}
		onValueChange={setFilter}
	/>
	<ZText aria-live="polite" tone="muted">
		外部owner：{filteredRows.length}条结果 · 第{page}/{totalPages}页 · sort = {sort
			? `${sort.columnId}/${sort.direction}`
			: 'none'}
	</ZText>
	<ZText tone="muted">
		示例用内存数组模拟query/cache层；filter与page不属于DataTable。受控sort同步表头状态，当前核心仍会对传入页执行同方向稳定排序。
	</ZText>
	<ZDataTable
		caption="服务检索结果"
		{columns}
		rows={pageRows}
		rowKey={(row) => row.id}
		{sort}
		onSortChange={setSort}
		emptyLabel="没有匹配服务"
	/>
	<ZPagination
		aria-label="服务结果分页"
		{page}
		{totalPages}
		onPageChange={(next) => (page = next)}
	/>
</ZStack>
