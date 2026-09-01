<script lang="ts">
	import {
		ZDrawer,
		ZDrawerClose,
		ZDrawerContent,
		ZDrawerDescription,
		ZDrawerOverlay,
		ZDrawerTitle,
		ZDrawerTrigger,
		ZStack,
		ZText
	} from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZText tone="muted">
		预设尺寸使用主题token；自定义值沿滑入轴生效，并保留90vw/90vh窄屏安全边界。
	</ZText>
	<ZStack direction="row" gap="medium" wrap>
		<ZDrawer>
			<ZDrawerTrigger variant="secondary">Small start</ZDrawerTrigger>
			<ZDrawerOverlay />
			<ZDrawerContent placement="start" size="small">
				<ZStack gap="large">
					<ZDrawerTitle>导航</ZDrawerTitle>
					<ZDrawerDescription>逻辑start自动适配RTL。</ZDrawerDescription>
					<ZDrawerClose>关闭</ZDrawerClose>
				</ZStack>
			</ZDrawerContent>
		</ZDrawer>
		<ZDrawer>
			<ZDrawerTrigger variant="secondary">Large bottom</ZDrawerTrigger>
			<ZDrawerOverlay />
			<ZDrawerContent placement="bottom" size="large">
				<ZStack gap="large">
					<ZDrawerTitle>批量操作</ZDrawerTitle>
					<ZDrawerDescription>底部Drawer使用完整内联宽度。</ZDrawerDescription>
					<ZDrawerClose>关闭</ZDrawerClose>
				</ZStack>
			</ZDrawerContent>
		</ZDrawer>
		<ZDrawer>
			<ZDrawerTrigger variant="secondary">响应式自定义尺寸</ZDrawerTrigger>
			<ZDrawerOverlay />
			<ZDrawerContent placement="end" size="min(32rem, calc(100vw - 2rem))">
				<ZStack gap="large">
					<ZDrawerTitle>详情面板</ZDrawerTitle>
					<ZDrawerDescription>
						CSS min()/calc()适合桌面宽面板，组件仍限制在当前viewport内。
					</ZDrawerDescription>
					<ZDrawerClose>关闭</ZDrawerClose>
				</ZStack>
			</ZDrawerContent>
		</ZDrawer>
		<ZDrawer>
			<ZDrawerTrigger variant="secondary">Full top</ZDrawerTrigger>
			<ZDrawerOverlay />
			<ZDrawerContent placement="top" size="full">
				<ZStack gap="large">
					<ZDrawerTitle>全屏工作区</ZDrawerTitle>
					<ZDrawerDescription>full明确覆盖整个viewport，不受普通90vh边界限制。</ZDrawerDescription>
					<ZDrawerClose>完成</ZDrawerClose>
				</ZStack>
			</ZDrawerContent>
		</ZDrawer>
	</ZStack>
</ZStack>
