<script lang="ts">
	import {
		ZDataTable,
		ZInput,
		ZPagination,
		ZStack,
		ZText,
		type DataTableColumn
	} from '@zadmin/zui';

	interface ReleaseRow {
		id: number;
		name: string;
		status: string;
	}

	const allRows: readonly ReleaseRow[] = Array.from({ length: 37 }, (_, index) => ({
		id: index + 1,
		name: `Release ${String(index + 1).padStart(2, '0')}`,
		status: index % 4 === 0 ? '审核中' : '已发布'
	}));
	const columns = [
		{ id: 'name', header: '版本', accessor: (row: ReleaseRow) => row.name },
		{ id: 'status', header: '状态', accessor: (row: ReleaseRow) => row.status }
	] satisfies readonly DataTableColumn<ReleaseRow>[];
	let query = $state('');
	let page = $state(1);
	let pageSize = $state(5);
	const filteredRows = $derived(
		allRows.filter((row) =>
			`${row.name} ${row.status}`
				.toLocaleLowerCase('zh-CN')
				.includes(query.toLocaleLowerCase('zh-CN'))
		)
	);
	const pageRows = $derived(filteredRows.slice((page - 1) * pageSize, page * pageSize));

	function changeQuery(next: string): void {
		query = next;
		page = 1;
	}
</script>

<ZStack gap="medium">
	<ZInput
		aria-label="筛选发布记录"
		placeholder="筛选版本或状态"
		value={query}
		onValueChange={changeQuery}
	/>
	<ZDataTable
		caption="发布记录"
		{columns}
		emptyLabel="没有匹配的发布记录"
		rowKey={(row) => row.id}
		rows={pageRows}
	/>
	<ZPagination
		bind:page
		bind:pageSize
		aria-label="发布记录分页"
		pageSizeOptions={[5, 10, 20]}
		totalItems={filteredRows.length}
	/>
	<ZText aria-live="polite" tone="muted">
		外部owner：{filteredRows.length}条结果 · page = {page} · pageSize = {pageSize}
	</ZText>
</ZStack>
