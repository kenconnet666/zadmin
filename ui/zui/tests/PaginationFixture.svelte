<script lang="ts">
	import ZPagination from '../src/components/navigation/ZPagination.svelte';

	let page = $state(6);
	let changes = $state(0);
	let focusPage = $state(6);
	let focusTotalItems = $state(95);
	let sizedPage = $state(6);
	let pageSize = $state(10);
	let pageSizeChanges = $state(0);
	let sizedPageChanges = $state(0);
</script>

<ZPagination
	bind:page
	aria-label="Fixture pagination"
	defaultPage={6}
	onPageChange={() => (changes += 1)}
	totalPages={20}
/>
<output data-testid="pagination-output">{page}:{changes}</output>

<ZPagination bind:page={focusPage} aria-label="Dynamic pagination" totalItems={focusTotalItems} />
<button type="button" data-testid="pagination-shrink" onclick={() => (focusTotalItems = 12)}
	>Shrink total
</button>
<output data-testid="pagination-focus-output">{focusPage}:{focusTotalItems}</output>

<ZPagination
	bind:page={sizedPage}
	bind:pageSize
	aria-label="Sized pagination"
	onPageChange={() => (sizedPageChanges += 1)}
	onPageSizeChange={() => (pageSizeChanges += 1)}
	pageSizeOptions={[10, 20, 50]}
	totalItems={95}
/>
<output data-testid="pagination-size-output"
	>{sizedPage}:{pageSize}:{sizedPageChanges}:{pageSizeChanges}</output
>
