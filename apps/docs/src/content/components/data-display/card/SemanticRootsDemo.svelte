<script lang="ts">
	import { ZCard, ZHeading, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZCard variant="outlined"><ZText>默认div只表达视觉分组。</ZText></ZCard>
	<ZCard as="section" aria-labelledby="card-section-title" variant="outlined">
		{#snippet header()}
			<ZHeading id="card-section-title" level={3} size="large">页面章节</ZHeading>
		{/snippet}
		<ZText>section由调用方提供可访问标题。</ZText>
	</ZCard>
	<ZCard as="article" aria-labelledby="card-article-title" variant="outlined">
		{#snippet header()}
			<ZHeading id="card-article-title" level={3} size="large">独立发布记录</ZHeading>
		{/snippet}
		<ZText>article只用于可独立分发的单一主题。</ZText>
	</ZCard>
</ZStack>
