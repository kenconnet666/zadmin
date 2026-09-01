<script lang="ts">
	import { ZCarousel, type SelectionKey } from '../src/entrypoints/index.js';
	const items = [
		{ id: 'one', label: 'Overview' },
		{ id: 'two', label: 'Metrics' },
		{ id: 'three', label: 'Events' }
	];
	let value = $state<SelectionKey>('one');
	let changes = $state(0);
</script>

<ZCarousel
	aria-label="Release carousel"
	{items}
	itemKey={(entry) => entry.id}
	itemLabel={(entry) => entry.label}
	bind:value
	onValueChange={() => (changes += 1)}
	data-testid="carousel"
>
	{#snippet item(entry)}<p>{entry.label} content</p>{/snippet}
</ZCarousel>
<output data-testid="carousel-output">{value}:{changes}</output>
