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
		<ZDrawerTrigger variant="secondary">标准关闭策略</ZDrawerTrigger>
		<ZDrawerOverlay />
		<ZDrawerContent placement="end" size="small">
			<ZStack gap="large">
				<ZDrawerTitle>筛选条件</ZDrawerTitle>
				<ZDrawerDescription>Escape、点击遮罩或显式按钮都会关闭。</ZDrawerDescription>
				<ZDrawerClose>应用筛选</ZDrawerClose>
			</ZStack>
		</ZDrawerContent>
	</ZDrawer>
	<ZDrawer>
		<ZDrawerTrigger variant="secondary">必须显式完成</ZDrawerTrigger>
		<ZDrawerOverlay />
		<ZDrawerContent
			dismissOnEscape={false}
			dismissOnPointerOutside={false}
			placement="end"
			size="small"
		>
			<ZStack gap="large">
				<ZDrawerTitle>未保存设置</ZDrawerTitle>
				<ZDrawerDescription>Escape和遮罩不会关闭，业务必须提供清晰的完成操作。</ZDrawerDescription>
				<ZDrawerClose>保存并关闭</ZDrawerClose>
			</ZStack>
		</ZDrawerContent>
	</ZDrawer>
</ZStack>
