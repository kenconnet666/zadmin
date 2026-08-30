<script lang="ts">
	import ZAccordion, {
		type AccordionValue
	} from '../src/components/compound/accordion/ZAccordion.svelte';
	import ZAccordionContent from '../src/components/compound/accordion/ZAccordionContent.svelte';
	import ZAccordionItem from '../src/components/compound/accordion/ZAccordionItem.svelte';
	import ZAccordionTrigger from '../src/components/compound/accordion/ZAccordionTrigger.svelte';

	let value = $state<AccordionValue | undefined>('a');
	let changes = $state(0);
	let multiple = $state<AccordionValue>(['x']);
</script>

<ZAccordion bind:value defaultValue="a" onValueChange={() => (changes += 1)}>
	<ZAccordionItem value="a">
		<ZAccordionTrigger
			data-testid="accordion-a"
			onclick={() => undefined}
			onfocus={() => undefined}
			onkeydown={() => undefined}>Alpha</ZAccordionTrigger
		>
		<ZAccordionContent data-testid="accordion-content-a">Alpha content</ZAccordionContent>
	</ZAccordionItem>
	<ZAccordionItem disabled value="b">
		<ZAccordionTrigger data-testid="accordion-b">Disabled</ZAccordionTrigger>
		<ZAccordionContent>Disabled content</ZAccordionContent>
	</ZAccordionItem>
	<ZAccordionItem value="c">
		<ZAccordionTrigger data-testid="accordion-c">Charlie</ZAccordionTrigger>
		<ZAccordionContent data-testid="accordion-content-c">Charlie content</ZAccordionContent>
	</ZAccordionItem>
</ZAccordion>
<output data-testid="accordion-output">{value ?? 'none'}:{changes}</output>

<ZAccordion bind:value={multiple} defaultValue={['x']} type="multiple">
	<ZAccordionItem value="x">
		<ZAccordionTrigger data-testid="accordion-x">Xray</ZAccordionTrigger>
		<ZAccordionContent>Xray content</ZAccordionContent>
	</ZAccordionItem>
	<ZAccordionItem value="y">
		<ZAccordionTrigger data-testid="accordion-y">Yankee</ZAccordionTrigger>
		<ZAccordionContent>Yankee content</ZAccordionContent>
	</ZAccordionItem>
</ZAccordion>
<output data-testid="accordion-multiple-output">
	{typeof multiple === 'string' ? multiple : multiple.join(',')}
</output>
