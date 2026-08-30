<script lang="ts">
	import {
		ZCheckbox,
		ZDataTable,
		ZField,
		ZInput,
		ZRadioGroup,
		ZRadioGroupItem,
		ZSlider,
		ZSwitch,
		ZTextarea,
		type DataTableColumn
	} from '../src/entrypoints/index.js';

	interface Row {
		readonly id: string;
		readonly label: string;
	}

	const rows: readonly Row[] = [
		{ id: 'alpha', label: 'Alpha' },
		{ id: 'beta', label: 'Beta' }
	];
	const columns: readonly DataTableColumn<Row>[] = [
		{ accessor: (row) => row.label, header: 'Label', id: 'label' }
	];
</script>

<ZInput aria-label="Generated input" data-testid="identity-input" />
<ZInput aria-label="Explicit input" data-testid="identity-explicit" id="consumer-input" />
<ZTextarea aria-label="Generated textarea" data-testid="identity-textarea" />
<ZCheckbox aria-label="Generated checkbox" data-testid="identity-checkbox" />
<ZSwitch aria-label="Generated switch" data-testid="identity-switch" />
<ZSlider aria-label="Generated slider" data-testid="identity-slider" />
<ZField label="Field identity">
	<ZInput data-testid="identity-field" />
</ZField>
<ZRadioGroup aria-label="Generated radio group" defaultValue="alpha">
	<ZRadioGroupItem aria-label="Alpha" data-testid="identity-radio-alpha" value="alpha" />
	<ZRadioGroupItem aria-label="Beta" data-testid="identity-radio-beta" value="beta" />
</ZRadioGroup>
<ZDataTable
	caption="Generated data table identities"
	{columns}
	rowKey={(row) => row.id}
	{rows}
	selectionMode="multiple"
/>
