<script lang="ts">
	import {
		ZDataTable,
		type DataTableColumn,
		type DataTableColumnVisibility,
		type DataTableColumnWidths,
		type ZDataTableController
	} from '../src/entrypoints/index.js';

	interface Row {
		id: string;
		name: string;
	}
	const rows: readonly Row[] = [{ id: 'row', name: 'Row' }];
	const columns: readonly DataTableColumn<Row>[] = [
		{ accessor: (row) => row.name, header: 'Name', id: 'name', resizable: true, width: 160 },
		...['constructor', 'toString', '__proto__'].map((id) => ({
			accessor: () => id,
			defaultHidden: true,
			header: id,
			id,
			resizable: true,
			width: 120
		}))
	];
	let visibility = $state.raw<DataTableColumnVisibility>({});
	let widths = $state.raw<DataTableColumnWidths>({});
	let controller = $state<ZDataTableController<string> | null>(null);
	let visibilityChanges = $state.raw<readonly DataTableColumnVisibility[]>([]);
	let widthChanges = $state.raw<readonly DataTableColumnWidths[]>([]);

	export function columnState() {
		return { controller, visibility, visibilityChanges, widths, widthChanges };
	}

	export function synchronizeColumns(
		nextVisibility: DataTableColumnVisibility,
		nextWidths: DataTableColumnWidths
	): void {
		visibility = nextVisibility;
		widths = nextWidths;
	}
</script>

<ZDataTable
	caption="Column state records"
	data-testid="data-table-column-state"
	{columns}
	{rows}
	rowKey={(row) => row.id}
	bind:columnVisibility={visibility}
	bind:columnWidths={widths}
	bind:controller
	onColumnVisibilityChange={(next) => (visibilityChanges = [...visibilityChanges, next])}
	onColumnWidthsChange={(next) => (widthChanges = [...widthChanges, next])}
/>
