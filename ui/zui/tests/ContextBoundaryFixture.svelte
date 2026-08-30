<script lang="ts">
	import {
		ZAccordionItem,
		ZAccordionTrigger,
		ZComboboxInput,
		ZCarousel,
		ZDialogContent,
		ZForm,
		ZList,
		ZMenuItem,
		ZMultiSelectTrigger,
		ZPopoverTrigger,
		ZPopconfirmTrigger,
		ZRadioGroupItem,
		ZSelectTrigger,
		ZTabsList,
		ZTimeline,
		ZTooltipTrigger
	} from '../src/entrypoints/index.js';

	const duplicateItems = [
		{ id: 'same', label: 'One' },
		{ id: 'same', label: 'Two' }
	];
	const duplicateTimeline = [
		{ id: 'same', title: 'One' },
		{ id: 'same', title: 'Two' }
	];
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
<svelte:boundary onerror={capture}><ZRadioGroupItem value="one" /></svelte:boundary>
<svelte:boundary onerror={capture}><ZSelectTrigger /></svelte:boundary>
<svelte:boundary onerror={capture}><ZTabsList /></svelte:boundary>
<svelte:boundary onerror={capture}><ZTooltipTrigger /></svelte:boundary>
<svelte:boundary onerror={capture}><ZList items={duplicateItems} /></svelte:boundary>
<svelte:boundary onerror={capture}><ZTimeline items={duplicateTimeline} /></svelte:boundary>
<svelte:boundary onerror={capture}><ZForm validateOn={['unsupported' as never]} /></svelte:boundary>
<svelte:boundary onerror={capture}><ZForm validationDelay={-1} /></svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZCarousel ariaLabel="Empty" items={[]} itemKey={() => 'empty'} itemLabel={() => 'Empty'}>
		{#snippet item()}empty{/snippet}
	</ZCarousel>
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
