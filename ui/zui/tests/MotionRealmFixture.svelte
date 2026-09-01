<script lang="ts">
	import {
		ZAccordion,
		ZAccordionContent,
		ZAccordionItem,
		ZAccordionTrigger,
		ZButton,
		ZCarousel,
		ZFileUpload,
		ZInput,
		ZInputGroup,
		ZProgress,
		ZProvider,
		ZSkeleton,
		ZTextarea
	} from '../src/entrypoints/index.js';

	let { motion = 'auto' }: { motion?: 'auto' | 'full' | 'reduced' } = $props();
	let motionOverride = $state<'auto' | 'full' | 'reduced'>();
	const resolvedMotion = $derived(motionOverride ?? motion);

	const slides = [
		{ id: 'one', label: 'One' },
		{ id: 'two', label: 'Two' }
	];
</script>

<button
	data-testid="motion-force-reduced"
	type="button"
	onclick={() => (motionOverride = 'reduced')}
>
	Reduce motion
</button>

<ZProvider motion={resolvedMotion}>
	<ZButton data-motion-contract data-testid="motion-button">Action</ZButton>
	<ZInput data-motion-contract data-testid="motion-input" />
	<ZTextarea data-motion-contract data-testid="motion-textarea" />
	<ZInputGroup data-motion-contract data-testid="motion-input-group">
		<ZInput data-motion-contract data-testid="motion-group-input" />
	</ZInputGroup>
	<ZFileUpload data-motion-contract data-testid="motion-file-upload" />

	<ZAccordion data-motion-contract data-testid="motion-accordion" defaultValue="motion">
		<ZAccordionItem value="motion">
			<ZAccordionTrigger data-motion-contract data-testid="motion-accordion-trigger">
				Motion
			</ZAccordionTrigger>
			<ZAccordionContent data-motion-contract data-testid="motion-accordion-content">
				Owner realm content
			</ZAccordionContent>
		</ZAccordionItem>
	</ZAccordion>

	<ZCarousel
		aria-label="Motion carousel"
		autoplayInterval={1000}
		data-motion-contract
		data-testid="motion-carousel"
		items={slides}
		itemKey={(entry) => entry.id}
		itemLabel={(entry) => entry.label}
	>
		{#snippet item(entry)}<span>{entry.label}</span>{/snippet}
	</ZCarousel>

	<ZProgress data-motion-contract data-testid="motion-progress" label="Loading" view="circle" />
	<ZSkeleton data-motion-contract data-testid="motion-skeleton" />
</ZProvider>
