<script lang="ts">
	import ZAccordion, {
		type AccordionType,
		type AccordionValue
	} from '../src/components/compound/accordion/ZAccordion.svelte';
	import ZAccordionContent from '../src/components/compound/accordion/ZAccordionContent.svelte';
	import ZAccordionItem from '../src/components/compound/accordion/ZAccordionItem.svelte';
	import ZAccordionTrigger from '../src/components/compound/accordion/ZAccordionTrigger.svelte';

	let type = $state<AccordionType>('single');
	let value = $state<AccordionValue>('a');

	function multiple(): void {
		type = 'multiple';
		value = ['a'];
	}
</script>

<button data-testid="accordion-props-multiple" onclick={multiple}>Multiple</button>
<ZAccordion
	bind:value
	collapsible={type === 'single' ? false : undefined}
	data-testid="accordion-props-root"
	{type}
>
	<ZAccordionItem value="a">
		<ZAccordionTrigger data-testid="accordion-props-a">A</ZAccordionTrigger>
		<ZAccordionContent>A content</ZAccordionContent>
	</ZAccordionItem>
	<ZAccordionItem value="b">
		<ZAccordionTrigger data-testid="accordion-props-b">B</ZAccordionTrigger>
		<ZAccordionContent>B content</ZAccordionContent>
	</ZAccordionItem>
</ZAccordion>
<output data-testid="accordion-props-output">
	{type}:{Array.isArray(value) ? value.join(',') : (value ?? 'null')}
</output>
