<script lang="ts">
	import { ZCard, ZStack, ZTable, ZText } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="large" align="start" wrap>
	<ZCard bodyPadding="none" variant="outlined">
		{#snippet header()}<ZText weight="semibold">表格铺满内容区</ZText>{/snippet}
		<ZTable caption="无内边距的发布信息" captionHidden>
			{#snippet header()}<tr><th scope="col">版本</th><th scope="col">状态</th></tr>{/snippet}
			<tr><td>0.1.0</td><td>待发布</td></tr>
		</ZTable>
	</ZCard>
	<ZCard bodyPadding="large" variant="outlined">
		<ZStack gap="medium">
			<ZText weight="semibold">正文保留阅读留白</ZText>
			<ZText tone="muted">bodyPadding="large" 为文字提供统一内边距。</ZText>
		</ZStack>
	</ZCard>
</ZStack>
