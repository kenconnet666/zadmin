<script lang="ts">
	import {
		ZAccordionItem,
		ZAccordionTrigger,
		ZComboboxInput,
		ZDialogContent,
		ZMenuItem,
		ZMultiSelectTrigger,
		ZPopoverTrigger,
		ZPopconfirmTrigger,
		ZRadioGroupItem,
		ZSelectTrigger,
		ZTabsList,
		ZTooltipTrigger
	} from '../src/entrypoints/index.js';

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

<output data-testid="context-boundary-output">{errors.length}:{errors.join('|')}</output>
