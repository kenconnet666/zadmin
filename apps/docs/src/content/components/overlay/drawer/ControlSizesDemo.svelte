<script lang="ts">
	import {
		controlSizes,
		ZStack,
		ZText,
		ZDrawer,
		ZDrawerTrigger,
		ZDrawerOverlay,
		ZDrawerContent,
		ZDrawerTitle,
		ZDrawerDescription,
		ZDrawerClose
	} from '@zadmin/zui';
</script>

<ZStack gap="large">
	{#each controlSizes as size (size)}
		<ZStack gap="small"
			><ZText size="small">{size}</ZText><ZDrawer
				><ZDrawerTrigger variant="outline">{size} 面板</ZDrawerTrigger><ZDrawerOverlay
				/><ZDrawerContent {size}
					><ZDrawerTitle>{size} Drawer</ZDrawerTitle><ZDrawerDescription
						>五档预设使用独立 Drawer token；full 与 CSS 自定义长度仍可用。</ZDrawerDescription
					><ZDrawerClose variant="outline">关闭</ZDrawerClose></ZDrawerContent
				></ZDrawer
			></ZStack
		>
	{/each}
</ZStack>
