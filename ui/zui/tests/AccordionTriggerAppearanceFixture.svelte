<script lang="ts">
	import {
		ZAccordion,
		ZAccordionContent,
		ZAccordionItem,
		ZAccordionTrigger,
		ZProvider,
		extendTheme,
		defaultTheme
	} from '../src/entrypoints/index.js';

	const theme = extendTheme(defaultTheme, { color: { primary: '#008060' } });
</script>

<ZProvider {theme}>
	<ZAccordion defaultValue="block">
		<ZAccordionItem value="block">
			<ZAccordionTrigger data-testid="trigger-block">Block trigger</ZAccordionTrigger>
			<ZAccordionContent>Block content</ZAccordionContent>
		</ZAccordionItem>
		<ZAccordionItem value="inline">
			<ZAccordionTrigger appearance="inline" data-testid="trigger-inline"
				>Inline trigger</ZAccordionTrigger
			>
			<ZAccordionContent>Inline content</ZAccordionContent>
		</ZAccordionItem>
		<ZAccordionItem disabled value="disabled">
			<ZAccordionTrigger appearance="inline" data-testid="trigger-disabled"
				>Disabled trigger</ZAccordionTrigger
			>
			<ZAccordionContent>Disabled content</ZAccordionContent>
		</ZAccordionItem>
	</ZAccordion>
</ZProvider>
