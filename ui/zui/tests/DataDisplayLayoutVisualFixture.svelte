<script lang="ts">
	import {
		ZAspectRatio,
		ZBox,
		ZDataTable,
		ZList,
		ZStack,
		ZTable,
		ZVirtualList,
		type DataTableColumn
	} from '../src/entrypoints/index.js';

	const rows = [
		{ id: 'one', name: 'Alpha' },
		{ id: 'two', name: 'Beta' }
	];
	const columns = [
		{ id: 'name', header: 'Name', accessor: (row: (typeof rows)[number]) => row.name }
	] satisfies readonly DataTableColumn<(typeof rows)[number]>[];
	const virtualRows = Array.from({ length: 20 }, (_, index) => `Virtual ${index}`);
</script>

<ZBox data-testid="box" style="width: 240px; height: 20px;">Box</ZBox>

<ZStack data-testid="stack-row" direction="row" gap="medium" style="width: 240px;">
	<div style="width: 40px; height: 20px;">A</div>
	<div style="width: 40px; height: 20px;">B</div>
</ZStack>

<ZAspectRatio data-testid="aspect" ratio="16 / 9" style="width: 320px;">Ratio</ZAspectRatio>

<ZList
	data-testid="list"
	ordered
	items={[
		{ key: 'one', label: 'One' },
		{ key: 'two', label: 'Two' }
	]}
/>

<div style="width: 180px;">
	<ZTable data-testid="table" caption="Wide table" scroll="auto">
		{#snippet header()}<tr
				><th style="min-width: 320px;">Name</th><th style="min-width: 320px;">Owner</th></tr
			>{/snippet}
		<tr><td>Alpha</td><td>Docs</td></tr>
	</ZTable>
</div>

<ZDataTable data-testid="data-table" caption="Rows" {columns} {rows} rowKey={(row) => row.id} />

<ZVirtualList
	data-testid="virtual-list"
	aria-label="Virtual rows"
	height={120}
	itemSize={30}
	items={virtualRows}
	itemKey={(row) => row}
>
	{#snippet item(row)}<div>{row}</div>{/snippet}
</ZVirtualList>
