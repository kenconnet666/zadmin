<script lang="ts">
	import { ZButton, ZDataTable, ZProvider } from '../src/entrypoints/index.js';

	type Row = { id: number; name: string };
	const rows: Row[] = [
		{ id: 1, name: 'One' },
		{ id: 2, name: 'Two' }
	];
	const columns = [{ id: 'name', header: 'Name', accessor: (row: Row) => row.name }];
</script>

<ZProvider
	componentDefaults={{
		button: { size: 'small', variant: 'secondary', fullWidth: true },
		dataTable: { virtualized: true, overscan: 0, selectionMode: 'multiple' }
	}}
>
	<ZButton data-testid="default-button">Default</ZButton>
	<ZButton data-testid="explicit-button" variant="primary" fullWidth={false}>Explicit</ZButton>
	<ZButton data-testid="busy-button" loading aria-pressed="true">Busy</ZButton>
	<ZDataTable
		data-testid="default-table"
		caption="Rows"
		{rows}
		{columns}
		rowKey={(row) => row.id}
		height={120}
	/>
	<ZProvider componentDefaults={null}>
		<ZButton data-testid="axis-null-button">Axis null</ZButton>
	</ZProvider>
	<ZProvider componentDefaults={{ button: null }}>
		<ZButton data-testid="component-null-button">Component null</ZButton>
	</ZProvider>
</ZProvider>
