<script lang="ts">
	import {
		controlSizes,
		ZStack,
		ZText,
		ZTabs,
		ZTabsList,
		ZTabsTrigger,
		ZTabsPanel
	} from '@zadmin/zui';
</script>

<ZStack gap="large">
	{#each controlSizes as size (size)}
		<ZStack gap="small"
			><ZText size="small">{size}</ZText><ZTabs {size} defaultValue="overview"
				><ZTabsList aria-label={size + ' 标签页'}
					><ZTabsTrigger value="overview">概览</ZTabsTrigger><ZTabsTrigger value="long"
						>记录</ZTabsTrigger
					><ZTabsTrigger value="disabled" disabled>不可用</ZTabsTrigger></ZTabsList
				><ZTabsPanel value="overview">{size}：悬停、键盘焦点和选中状态分别可辨。</ZTabsPanel
				><ZTabsPanel value="long">当前尺寸的发布记录。</ZTabsPanel></ZTabs
			></ZStack
		>
	{/each}
</ZStack>
