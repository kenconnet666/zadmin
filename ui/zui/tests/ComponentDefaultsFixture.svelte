<script lang="ts">
	import {
		ZButton,
		ZCard,
		ZDataTable,
		ZField,
		ZInput,
		ZPagination,
		ZProvider,
		ZTag
	} from '../src/entrypoints/index.js';

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
		card: { variant: 'outlined' },
		dataTable: { virtualized: true, overscan: 0, selectionMode: 'multiple' },
		input: { size: 'large' },
		pagination: { mode: 'simple' },
		tag: { size: 'small', tone: 'accent' }
	}}
>
	<ZButton data-testid="default-button">Default</ZButton>
	<ZButton data-testid="explicit-button" variant="primary" fullWidth={false}>Explicit</ZButton>
	<ZButton data-testid="busy-button" loading aria-pressed="true">Busy</ZButton>
	<ZInput data-testid="default-input" />
	<ZInput data-testid="explicit-input" size="small" />
	<ZField data-testid="local-field" label="Local" size="small">
		<ZInput data-testid="local-input" />
	</ZField>
	<ZTag data-testid="default-tag">Default tag</ZTag>
	<ZCard data-testid="default-card">Default card</ZCard>
	<ZPagination data-testid="default-pagination" totalPages={5} />
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
