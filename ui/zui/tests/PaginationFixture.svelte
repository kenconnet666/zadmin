<script lang="ts">
	import ZPagination from '../src/components/navigation/ZPagination.svelte';

	let page = $state(6);
	let changes = $state(0);
</script>

<ZPagination
	bind:page
	aria-label="Fixture pagination"
	defaultPage={6}
	onPageChange={() => (changes += 1)}
	totalPages={20}
/>
<output data-testid="pagination-output">{page}:{changes}</output>
