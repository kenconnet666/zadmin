<script lang="ts">
	import { ZCard, ZHeading, ZStack, ZText } from '@zadmin/zui';
</script>

<ZCard as="article" aria-labelledby="card-release-title" variant="outlined">
	{#snippet header()}
		<ZStack gap="small">
			<ZHeading id="card-release-title" level={3} size="large">生产部署</ZHeading>
			<ZText tone="muted">单一发布主题使用显式article，不让普通视觉容器污染文档大纲。</ZText>
		</ZStack>
	{/snippet}
	<ZText>版本v2.4.0已通过全部门禁。</ZText>
	{#snippet footer()}<ZText tone="muted">更新于刚刚</ZText>{/snippet}
</ZCard>
