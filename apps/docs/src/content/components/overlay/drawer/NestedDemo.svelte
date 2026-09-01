<script lang="ts">
	import {
		ZDrawer,
		ZDrawerClose,
		ZDrawerContent,
		ZDrawerDescription,
		ZDrawerOverlay,
		ZDrawerTitle,
		ZDrawerTrigger,
		ZIcon,
		ZInput,
		ZStack,
		ZText
	} from '@zadmin/zui';

	let outerOpen = $state(false);
	let innerOpen = $state(false);
</script>

<ZStack gap="medium">
	<ZDrawer bind:open={outerOpen}>
		<ZDrawerTrigger variant="secondary">编辑发布流程</ZDrawerTrigger>
		<ZDrawerOverlay />
		<ZDrawerContent placement="end" size="medium">
			<ZStack gap="large">
				<ZStack align="center" direction="row" justify="between">
					<ZStack gap="small">
						<ZDrawerTitle>发布流程</ZDrawerTitle>
						<ZDrawerDescription>父层保持挂载，子层独占焦点与Escape。</ZDrawerDescription>
					</ZStack>
					<ZDrawerClose aria-label="关闭发布流程" title="关闭" variant="ghost">
						<ZIcon name="close" />
					</ZDrawerClose>
				</ZStack>
				<ZInput aria-label="流程名称" name="workflow" value="Production release" />
				<ZDrawer bind:open={innerOpen}>
					<ZDrawerTrigger variant="secondary">配置审批人</ZDrawerTrigger>
					<ZDrawerOverlay />
					<ZDrawerContent placement="end" size="small">
						<ZStack gap="large">
							<ZDrawerTitle>审批人</ZDrawerTitle>
							<ZDrawerDescription>
								最顶层Drawer关闭后，焦点回到父层触发按钮；父层仍保持滚动锁。
							</ZDrawerDescription>
							<ZInput aria-label="审批人" name="reviewer" value="Release manager" />
							<ZDrawerClose>保存审批人</ZDrawerClose>
						</ZStack>
					</ZDrawerContent>
				</ZDrawer>
			</ZStack>
		</ZDrawerContent>
	</ZDrawer>
	<ZText tone="muted"
		>父层 {outerOpen ? 'open' : 'closed'} · 子层 {innerOpen ? 'open' : 'closed'}</ZText
	>
</ZStack>
