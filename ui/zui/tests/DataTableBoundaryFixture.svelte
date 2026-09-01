<script lang="ts">
	import {
		ZDataTable,
		type DataSortDescriptor,
		type DataTableColumn
	} from '../src/entrypoints/index.js';

	interface Row {
		id: number;
		name: string;
	}
	const rows: readonly Row[] = [{ id: 1, name: 'One' }];
	const columns = [
		{ accessor: (row: Row) => row.name, header: 'Name', id: 'name', sortable: true }
	] satisfies readonly DataTableColumn<Row>[];
	let errors = $state<string[]>([]);
	function capture(error: unknown): void {
		errors = [...errors, error instanceof Error ? error.message : String(error)];
	}
</script>

<svelte:boundary onerror={capture}>
	<ZDataTable
		caption="Invalid state key"
		{columns}
		{rows}
		rowKey={(row) => row.id}
		defaultSelectedKeys={[Number.NaN]}
		selectionMode="multiple"
	/>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZDataTable
		caption="No visible columns"
		{columns}
		{rows}
		rowKey={(row) => row.id}
		defaultColumnVisibility={{ name: false }}
	/>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZDataTable
		caption="Invalid sticky width"
		columns={[{ ...columns[0], sticky: 'start', width: '40%' }]}
		{rows}
		rowKey={(row) => row.id}
	/>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZDataTable
		caption="Invalid width bounds"
		columns={[{ ...columns[0], minWidth: 200, maxWidth: 100 }]}
		{rows}
		rowKey={(row) => row.id}
	/>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZDataTable
		caption="Invalid sort direction"
		{columns}
		{rows}
		rowKey={(row) => row.id}
		sort={{ columnId: 'name', direction: 'sideways' } as unknown as DataSortDescriptor}
	/>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZDataTable
		caption="Invalid row offset"
		{columns}
		{rows}
		rowKey={(row) => row.id}
		rowIndexOffset={-1}
	/>
</svelte:boundary>

<output data-testid="data-table-boundary-output">{errors.length}:{errors.join('|')}</output>
