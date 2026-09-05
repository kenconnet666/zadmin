<script lang="ts">
	import {
		ZAccordion,
		ZAccordionContent,
		ZAccordionItem,
		ZAccordionTrigger,
		ZCarousel,
		ZDialog,
		ZDialogContent,
		ZDialogOverlay,
		ZDialogTitle,
		ZDialogTrigger,
		ZPopover,
		ZPopoverContent,
		ZPopoverTrigger,
		ZToast,
		ZTooltip,
		ZTooltipContent,
		ZTooltipTrigger,
		ZTour,
		type SelectionKey
	} from '../src/entrypoints/index.js';

	type Mode = 'accordion' | 'carousel' | 'dialog' | 'popover' | 'toast' | 'tooltip' | 'tour';

	const modes: readonly Mode[] = [
		'carousel',
		'toast',
		'dialog',
		'popover',
		'tooltip',
		'accordion',
		'tour'
	];
	const carouselItems = [
		{ id: 'one', label: 'One' },
		{ id: 'two', label: 'Two' }
	];
	const tourSteps = [
		{ description: 'Centered tour description', id: 'center', target: null, title: 'Centered tour' }
	];
	let mode = $state<Mode>('carousel');
	let callbackCount = $state(0);
	let pauseChangeCount = $state(0);
	let dialogOpen = $state(true);
	let popoverOpen = $state(true);
	let tooltipOpen = $state(true);
	let accordionValue = $state<SelectionKey | null>('item');
	let tourOpen = $state(true);

	function markCallback(): void {
		callbackCount += 1;
	}
	function markPauseChange(): void {
		pauseChangeCount += 1;
	}
	function closeActive(): void {
		dialogOpen = false;
		popoverOpen = false;
		tooltipOpen = false;
		accordionValue = null;
		tourOpen = false;
	}
</script>

<nav aria-label="Callback forwarding modes" data-testid="mode-switcher">
	{#each modes as next (next)}
		<button data-mode={next} type="button" onclick={() => (mode = next)}>{next}</button>
	{/each}
</nav>
<button data-testid="close-active" type="button" onclick={closeActive}>Close active</button>
<output data-testid="callback-count">{callbackCount}</output>
<output data-testid="pause-change-count">{pauseChangeCount}</output>

{#if mode === 'carousel'}
	<ZCarousel
		aria-label="Callback carousel"
		data-testid="carousel"
		items={carouselItems}
		itemKey={(item) => item.id}
		itemLabel={(item) => item.label}
		onfocusin={markCallback}
		onfocusout={markCallback}
		onmouseenter={markCallback}
		onmouseleave={markCallback}
	>
		{#snippet item(item)}{item.label}{/snippet}
	</ZCarousel>
{:else if mode === 'toast'}
	<ZToast
		data-testid="toast"
		dismissible={false}
		onfocusin={markCallback}
		onfocusout={markCallback}
		onmouseenter={markCallback}
		onmouseleave={markCallback}
		onPauseChange={markPauseChange}
		title="Callback toast"
	/>
{:else if mode === 'dialog'}
	<ZDialog open={dialogOpen}>
		<ZDialogTrigger>Open dialog</ZDialogTrigger>
		<ZDialogOverlay data-testid="dialog-overlay" ontransitionend={markCallback} />
		<ZDialogContent data-testid="dialog-content" ontransitionend={markCallback}>
			<ZDialogTitle>Callback dialog</ZDialogTitle>
		</ZDialogContent>
	</ZDialog>
{:else if mode === 'popover'}
	<ZPopover open={popoverOpen}>
		<ZPopoverTrigger>Open popover</ZPopoverTrigger>
		<ZPopoverContent data-testid="popover-content" ontransitionend={markCallback}>
			Popover content
		</ZPopoverContent>
	</ZPopover>
{:else if mode === 'tooltip'}
	<ZTooltip open={tooltipOpen}>
		<ZTooltipTrigger>Tooltip trigger</ZTooltipTrigger>
		<ZTooltipContent data-testid="tooltip-content" ontransitionend={markCallback}>
			Tooltip content
		</ZTooltipContent>
	</ZTooltip>
{:else if mode === 'accordion'}
	<ZAccordion value={accordionValue}>
		<ZAccordionItem value="item">
			<ZAccordionTrigger>Accordion trigger</ZAccordionTrigger>
			<ZAccordionContent data-testid="accordion-content" ontransitionend={markCallback}>
				Accordion content
			</ZAccordionContent>
		</ZAccordionItem>
	</ZAccordion>
{:else}
	<ZTour
		data-testid="tour-content"
		ontransitionend={markCallback}
		open={tourOpen}
		steps={tourSteps}
	>
		<!-- Content is declared through the step contract. -->
	</ZTour>
{/if}
