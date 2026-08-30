<script lang="ts">
	import {
		ZDrawer,
		ZDrawerClose,
		ZDrawerContent,
		ZDrawerDescription,
		ZDrawerOverlay,
		ZDrawerTitle,
		ZDrawerTrigger,
		ZStack
	} from '@zadmin/zui';
</script>

<ZStack direction="row" gap="medium" wrap>
	<ZDrawer>
		<ZDrawerTrigger variant="secondary">Small start Drawer</ZDrawerTrigger><ZDrawerOverlay />
		<ZDrawerContent placement="start" size="small"
			><ZStack gap="large"
				><ZDrawerTitle>导航</ZDrawerTitle><ZDrawerDescription
					>逻辑start自动适配RTL。</ZDrawerDescription
				><ZDrawerClose>关闭</ZDrawerClose></ZStack
			></ZDrawerContent
		>
	</ZDrawer>
	<ZDrawer>
		<ZDrawerTrigger variant="secondary">Large bottom Drawer</ZDrawerTrigger><ZDrawerOverlay />
		<ZDrawerContent placement="bottom" size="large"
			><ZStack gap="large"
				><ZDrawerTitle>批量操作</ZDrawerTitle><ZDrawerDescription
					>底部Drawer使用完整内联宽度。</ZDrawerDescription
				><ZDrawerClose>关闭</ZDrawerClose></ZStack
			></ZDrawerContent
		>
	</ZDrawer>
</ZStack>
