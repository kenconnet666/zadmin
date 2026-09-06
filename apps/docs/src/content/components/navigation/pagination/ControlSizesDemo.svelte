<script lang="ts">
	import { controlSizes, ZStack, ZText, ZPagination } from '@zadmin/zui';
</script>

<ZStack gap="large">
	{#each controlSizes as size (size)}
		<ZStack gap="small"
			><ZText size="small">{size}</ZText><ZPagination
				{size}
				aria-label={size + ' 完整分页'}
				totalItems={128}
				defaultPage={3}
				pageSizeOptions={[10, 20, 50]}
			/><ZPagination
				{size}
				aria-label={size + ' 简洁分页'}
				mode="simple"
				totalPages={12}
				defaultPage={3}
			/></ZStack
		>
	{/each}
</ZStack>
