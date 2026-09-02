<script lang="ts">
	import { ZBox, ZButton, ZStack, ZTag, ZText } from '@zadmin/zui';
</script>

<ZBox style="max-width: 20rem">
	<ZStack gap="medium">
		<ZText weight="semibold">窄容器操作与筛选</ZText>
		<ZStack align="center" direction="row" gap="small" wrap>
			{#each ['生产', '预发布', '只读', '审计中'] as label (label)}
				<ZTag>{label}</ZTag>
			{/each}
			<ZButton size="small" variant="secondary">清空筛选</ZButton>
		</ZStack>
	</ZStack>
</ZBox>
