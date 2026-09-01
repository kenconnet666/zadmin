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
	let selectedKeys = $state<readonly string[]>(['api']);
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
			: 'none'} · 跨页selected = {selectedKeys.join(', ') || 'none'}
	</ZText>
	<ZText tone="muted">
		示例用内存数组模拟query/cache层；filter、page、请求和URL状态属于外部owner。sortingMode="server"
		只发出排序意图，不会把当前页错误地二次排序。
	</ZText>
	<ZDataTable
		caption="服务检索结果"
		{columns}
		rows={pageRows}
		rowKey={(row) => row.id}
		rowIndexOffset={(page - 1) * pageSize}
		totalRowCount={filteredRows.length}
		{sort}
		onSortChange={setSort}
		sortingMode="server"
		selectionMode="multiple"
		bind:selectedKeys
		selectAllLabel="选择当前页全部服务"
		selectionLabel={(row) => `选择 ${row.name}`}
		emptyLabel="没有匹配服务"
	/>
	<ZPagination
		aria-label="服务结果分页"
		{page}
		{totalPages}
		onPageChange={(next) => (page = next)}
	/>
</ZStack>
