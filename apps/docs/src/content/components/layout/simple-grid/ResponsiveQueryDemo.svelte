<script lang="ts">
	import { ZCard, ZContainer, ZSimpleGrid, ZText } from '@zadmin/zui';

	const columns = { base: 1, small: 2, medium: 3 } as const;
	const query = { container: 'simple-grid-demo' } as const;
</script>

<ZContainer queryName="simple-grid-demo" size="small">
	<ZSimpleGrid {columns} {query} gap={{ base: 'small', medium: 'large' }}>
		{#each ['基础', '小容器', '中容器'] as label (label)}
			<ZCard><ZText>{label}</ZText></ZCard>
		{/each}
	</ZSimpleGrid>
</ZContainer>
