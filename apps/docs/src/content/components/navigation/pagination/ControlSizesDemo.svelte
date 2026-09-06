<script lang="ts">
	import { controlSizes, ZStack, ZText, ZPagination } from '@zadmin/zui';
</script>

<ZStack gap="large">
	{#each controlSizes as size (size)}
		<ZStack gap="small"
			><ZText size="small">{size}</ZText><ZPagination
				{size}
				totalItems={128}
				defaultPage={3}
				pageSizeOptions={[10, 20, 50]}
			/><ZPagination {size} mode="simple" totalPages={12} defaultPage={3} /></ZStack
		>
	{/each}
</ZStack>
