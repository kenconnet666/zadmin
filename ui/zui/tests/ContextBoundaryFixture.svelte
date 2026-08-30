<script lang="ts">
	import {
		ZAccordionItem,
		ZAccordionTrigger,
		ZComboboxInput,
		ZCarousel,
		ZDialogContent,
		ZDataTable,
		ZFileUpload,
		ZFormField,
		ZList,
		ZMenuItem,
		ZMultiSelectTrigger,
		ZPopoverTrigger,
		ZPopconfirmTitle,
		ZPopconfirmTrigger,
		ZRadioGroupItem,
		ZSelectTrigger,
		ZTabsList,
		ZTimeline,
		ZTooltipTrigger,
		ZVirtualList
	} from '../src/entrypoints/index.js';

	const duplicateItems = [
		{ id: 'same', label: 'One' },
		{ id: 'same', label: 'Two' }
	];
	const duplicateTimeline = [
		{ id: 'same', title: 'One' },
		{ id: 'same', title: 'Two' }
	];
	const tableRows = [
		{ id: 'same', name: 'One' },
		{ id: 'same', name: 'Two' }
	];
	const tableColumns = [
		{ accessor: (row: (typeof tableRows)[number]) => row.name, header: 'One', id: 'same' },
		{ accessor: (row: (typeof tableRows)[number]) => row.name, header: 'Two', id: 'same' }
	];
	const duplicateVirtualItems = [{ id: 'same' }, { id: 'same' }];
	let errors = $state<string[]>([]);
	function capture(error: unknown): void {
		errors = [...errors, error instanceof Error ? error.message : String(error)];
	}
</script>

<svelte:boundary onerror={capture}><ZAccordionItem value="one" /></svelte:boundary>
<svelte:boundary onerror={capture}><ZAccordionTrigger /></svelte:boundary>
<svelte:boundary onerror={capture}><ZComboboxInput /></svelte:boundary>
<svelte:boundary onerror={capture}><ZDialogContent /></svelte:boundary>
<svelte:boundary onerror={capture}><ZMenuItem value="one" /></svelte:boundary>
<svelte:boundary onerror={capture}><ZMultiSelectTrigger /></svelte:boundary>
<svelte:boundary onerror={capture}><ZPopoverTrigger /></svelte:boundary>
<svelte:boundary onerror={capture}><ZPopconfirmTrigger /></svelte:boundary>
<svelte:boundary onerror={capture}><ZPopconfirmTitle /></svelte:boundary>
<svelte:boundary onerror={capture}><ZFormField label="Invalid" name="invalid" /></svelte:boundary>
<svelte:boundary onerror={capture}><ZRadioGroupItem value="one" /></svelte:boundary>
<svelte:boundary onerror={capture}><ZSelectTrigger /></svelte:boundary>
<svelte:boundary onerror={capture}><ZTabsList /></svelte:boundary>
<svelte:boundary onerror={capture}><ZTooltipTrigger /></svelte:boundary>
<svelte:boundary onerror={capture}><ZList items={duplicateItems} /></svelte:boundary>
<svelte:boundary onerror={capture}><ZTimeline items={duplicateTimeline} /></svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZCarousel ariaLabel="Empty" items={[]} itemKey={() => 'empty'} itemLabel={() => 'Empty'}>
		{#snippet item()}empty{/snippet}
	</ZCarousel>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZFileUpload inputLabel="Invalid" maxFiles={0} />
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZFileUpload inputLabel="Invalid" maxSize={-1} />
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZVirtualList ariaLabel="Invalid" height={40} itemSize={0} items={[]} itemKey={() => 'none'}>
		{#snippet item()}never{/snippet}
	</ZVirtualList>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZVirtualList
		ariaLabel="Duplicates"
		height={40}
		items={duplicateVirtualItems}
		itemKey={(item) => item.id}
	>
		{#snippet item()}never{/snippet}
	</ZVirtualList>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZDataTable caption="No columns" columns={[]} rows={[]} rowKey={() => 'none'} />
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZDataTable caption="Duplicate columns" columns={tableColumns} rows={[]} rowKey={() => 'none'} />
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZDataTable
		caption="Duplicate rows"
		columns={tableColumns.slice(0, 1)}
		rows={tableRows}
		rowKey={(row) => row.id}
	/>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZCarousel
		ariaLabel="Duplicates"
		items={['one', 'two']}
		itemKey={() => 'same'}
		itemLabel={(value) => value}
	>
		{#snippet item(value)}{value}{/snippet}
	</ZCarousel>
</svelte:boundary>

<output data-testid="context-boundary-output">{errors.length}:{errors.join('|')}</output>
