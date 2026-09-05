<script lang="ts">
	import {
		ZButton,
		ZDataTable,
		ZDescriptionList,
		type DataSortDescriptor,
		type DataTableColumn,
		type DataTableColumnVisibility,
		type DataTableColumnWidths,
		type SelectionKey,
		type ZDataTableController
	} from '../src/entrypoints/index.js';

	interface Row {
		detail: string;
		id: SelectionKey;
		name: string;
		owner: string;
	}

	let rows = $state<readonly Row[]>([
		{ detail: 'Numeric key', id: 1, name: 'Zulu', owner: 'Platform' },
		{ detail: 'String key', id: '1', name: 'Alpha', owner: 'Docs' },
		{ detail: 'Disabled row', id: 'locked', name: 'Locked', owner: 'Security' }
	]);
	const columns = [
		{
			accessor: (row: Row) => row.name,
			header: 'Name',
			id: 'name',
			resizable: true,
			sortable: true,
			sticky: 'start',
			width: 160
		},
		{
			accessor: (row: Row) => row.owner,
			defaultHidden: true,
			header: 'Owner',
			id: 'owner',
			width: 140
		}
	] satisfies readonly DataTableColumn<Row>[];
	const defaultSort = {
		columnId: 'name',
		direction: 'ascending'
	} as const satisfies DataSortDescriptor;
	let observedSort = $state<DataSortDescriptor | undefined>(defaultSort);
	let selectedKeys = $state<readonly SelectionKey[]>([1]);
	let expandedKeys = $state<readonly SelectionKey[]>([]);
	let columnVisibility = $state<DataTableColumnVisibility>({});
	let columnWidths = $state<DataTableColumnWidths>({});
	let controller = $state<ZDataTableController<SelectionKey> | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	const serverRows: readonly Row[] = [
		{ detail: 'Server order first', id: 'server-z', name: 'Zulu', owner: 'Platform' },
		{ detail: 'Server order second', id: 'server-a', name: 'Alpha', owner: 'Docs' }
	];
	let serverSort = $state<DataSortDescriptor | undefined>({
		columnId: 'name',
		direction: 'ascending'
	});

	interface VirtualRow {
		id: string;
		name: string;
	}
	let virtualRows = $state<readonly VirtualRow[]>(
		Array.from({ length: 300 }, (_, index) => ({
			id: `virtual-${index}`,
			name: `Virtual ${index}`
		}))
	);
	const virtualColumns = [
		{ accessor: (row: VirtualRow) => row.name, header: 'Virtual row', id: 'name', width: 220 }
	] satisfies readonly DataTableColumn<VirtualRow>[];
	let virtualController = $state<ZDataTableController<string> | null>(null);
	let virtualSelected = $state<readonly string[]>([]);
</script>

{#snippet expandedRow(row: Row, index: number)}
	<ZDescriptionList
		aria-label={`${row.name} details`}
		items={[{ description: row.detail, key: `detail-${index}`, term: 'Detail' }]}
	/>
{/snippet}

<div>
	<ZButton
		data-testid="data-table-toggle-owner"
		onclick={() => controller?.setColumnVisible('owner', true)}
	>
		Show owner
	</ZButton>
	<ZButton data-testid="data-table-loading" onclick={() => (loading = !loading)}>Loading</ZButton>
	<ZButton data-testid="data-table-error" onclick={() => (error = error ? null : 'Rows failed')}
		>Error</ZButton
	>
	<ZButton
		data-testid="data-table-remove-focused"
		onclick={() => (rows = rows.filter(({ id }) => id !== 1))}
	>
		Remove focused
	</ZButton>
	<ZDataTable
		caption="Production rows"
		{columns}
		{defaultSort}
		{error}
		{expandedRow}
		isRowDisabled={(row) => row.id === 'locked'}
		{loading}
		loadingLabel="Refreshing rows"
		{rows}
		rowKey={(row) => row.id}
		selectionLabel={(row) => `Select ${typeof row.id}:${row.id}`}
		selectionMode="multiple"
		bind:columnVisibility
		bind:columnWidths
		bind:controller
		bind:expandedKeys
		bind:selectedKeys
		onSortChange={(next) => (observedSort = next)}
		data-testid="data-table-production"
	/>
	<output data-testid="data-table-production-output">
		{selectedKeys.map((key) => `${typeof key}:${key}`).join(',')}|{expandedKeys.join(
			','
		)}|{observedSort
			? `${observedSort.columnId}:${observedSort.direction}`
			: 'none'}|{controller?.visibleColumnIds.join(',')}|{columnWidths.name ?? 160}
	</output>

	<ZDataTable
		caption="Server rows"
		{columns}
		rows={serverRows}
		rowKey={(row) => row.id}
		sort={serverSort}
		sortingMode="server"
		onSortChange={(next) => (serverSort = next)}
		data-testid="data-table-server"
	/>

	<ZButton
		data-testid="data-table-virtual-focus"
		onclick={() => virtualController?.focusRow('virtual-250', 'selection')}
	>
		Focus virtual row
	</ZButton>
	<ZButton
		data-testid="data-table-virtual-prepend"
		onclick={() => (virtualRows = [{ id: 'virtual-new', name: 'Virtual new' }, ...virtualRows])}
	>
		Prepend virtual row
	</ZButton>
	<ZDataTable
		caption="Virtual rows"
		columns={virtualColumns}
		rows={virtualRows}
		rowKey={(row) => row.id}
		selectionMode="multiple"
		virtualized
		height={176}
		rowHeight={44}
		ssrViewportSize={132}
		bind:controller={virtualController}
		bind:selectedKeys={virtualSelected}
		data-testid="data-table-virtual"
	/>
</div>
