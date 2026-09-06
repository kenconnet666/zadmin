<script lang="ts">
	import { ZContainer, ZStack, ZText } from '@zadmin/zui';
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large">
	{#each sizes as size (size)}
		<ZContainer {size}><ZText>{size} 最大宽度容器</ZText></ZContainer>
	{/each}
	<ZText tone="muted"
		>size选择主题中的容器最大宽度，gutter控制逻辑留白；不会改变内部控件高度。</ZText
	>
</ZStack>
