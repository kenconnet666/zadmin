<script lang="ts">
	import {
		ZAccordion,
		ZAccordionContent,
		ZAccordionItem,
		ZAccordionTrigger
	} from '../src/entrypoints/index.js';
</script>

<ZAccordion defaultValue="outer">
	<ZAccordionItem value="outer">
		<ZAccordionTrigger>Outer</ZAccordionTrigger>
		<ZAccordionContent>
			<ZAccordion>
				<ZAccordionTrigger>Invalid inherited item</ZAccordionTrigger>
			</ZAccordion>
		</ZAccordionContent>
	</ZAccordionItem>
</ZAccordion>
