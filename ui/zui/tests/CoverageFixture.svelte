<script lang="ts">
	import {
		ZAlert,
		ZButton,
		ZCarousel,
		ZEmpty,
		ZList,
		ZProgress,
		ZProvider,
		ZResult,
		ZSkeleton,
		ZTimeline,
		ZToast,
		type SelectionKey
	} from '../src/entrypoints/index.js';

	const listItems = [
		{ id: 'one', label: 'One' },
		{ id: 'two', label: 'Two' }
	];
	const timelineItems = [{ id: 'queued', title: 'Queued' }];
	const slides = [
		{ id: 'a', label: 'Alpha' },
		{ id: 'b', label: 'Beta' }
	];
	let carouselValue = $state<SelectionKey>('b');
	let carouselChanges = $state(0);
	let alertDismissed = $state(0);
	let toastActions = $state(0);
</script>

<ZList items={listItems} data-testid="coverage-list" />
<ZList items={listItems} data-testid="coverage-list-custom">
	{#snippet item(entry)}<em>Custom {entry.label}</em>{/snippet}
</ZList>

<ZEmpty title="Nothing here" headingLevel={4} data-testid="coverage-empty">
	{#snippet icon()}<span>icon</span>{/snippet}
	Description
	{#snippet actions()}<ZButton>Recover</ZButton>{/snippet}
</ZEmpty>

<ZProvider motion="reduced">
	<ZSkeleton shape="circle" width={40} data-testid="coverage-skeleton-circle" />
	<ZSkeleton shape="rectangle" height="3rem" data-testid="coverage-skeleton-rectangle" />
	<ZCarousel
		ariaLabel="Reduced carousel"
		items={slides}
		itemKey={(entry) => entry.id}
		itemLabel={(entry) => entry.label}
		autoplayInterval={1000}
		data-testid="coverage-carousel-reduced"
	>
		{#snippet item(entry)}<span>{entry.label}</span>{/snippet}
	</ZCarousel>
</ZProvider>

<ZCarousel
	ariaLabel="Coverage carousel"
	items={slides}
	itemKey={(entry) => entry.id}
	itemLabel={(entry) => entry.label}
	loop={false}
	pauseOnHover={false}
	autoplayInterval={1000}
	bind:value={carouselValue}
	onValueChange={() => (carouselChanges += 1)}
	data-testid="coverage-carousel"
>
	{#snippet item(entry)}<span>{entry.label}</span>{/snippet}
</ZCarousel>

<ZTimeline items={timelineItems} data-testid="coverage-timeline">
	{#snippet item(entry)}<em>{entry.title}</em>{/snippet}
</ZTimeline>

<ZAlert title="Static notice" live="off" />
<ZAlert
	title="Urgent notice"
	live="assertive"
	tone="danger"
	dismissible
	onDismiss={() => (alertDismissed += 1)}
	data-testid="coverage-alert"
>
	Danger details
	{#snippet action()}<ZButton>Resolve</ZButton>{/snippet}
</ZAlert>

<ZResult title="Warning result" tone="warning" headingLevel={3} data-testid="coverage-result">
	{#snippet icon()}<span>!</span>{/snippet}
	Result description
	{#snippet actions()}<ZButton>Retry</ZButton>{/snippet}
</ZResult>

<ZToast
	title="Danger toast"
	tone="danger"
	dismissible={false}
	data-testid="coverage-toast-danger"
/>
<ZToast
	title="Action toast"
	actionLabel="Act"
	dismissible={false}
	onAction={() => (toastActions += 1)}
	data-testid="coverage-toast-action"
/>

<ZProgress
	label="Custom progress"
	min={10}
	max={20}
	value={25}
	formatValue={(value) => `${value} units`}
/>
<ZProgress label="Indeterminate line" />

<output data-testid="coverage-output"
	>{carouselValue}:{carouselChanges}:{alertDismissed}:{toastActions}</output
>
