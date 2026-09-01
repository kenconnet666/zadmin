<script lang="ts">
	import { ZHeading, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	{#each [1, 2, 3, 4, 5, 6] as level (level)}
		<ZHeading level={level as 1 | 2 | 3 | 4 | 5 | 6} size="large">
			真实 h{level} · 相同视觉字号
		</ZHeading>
	{/each}
</ZStack>
