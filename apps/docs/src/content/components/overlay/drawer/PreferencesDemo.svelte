<script lang="ts">
	import {
		ZDrawer,
		ZDrawerClose,
		ZDrawerContent,
		ZDrawerDescription,
		ZDrawerOverlay,
		ZDrawerTitle,
		ZDrawerTrigger,
		ZProvider,
		ZSegmented,
		ZStack,
		ZText,
		type SelectionKey,
		type ZuiDirection,
		type ZuiMotion
	} from '@zadmin/zui';

	let direction = $state<ZuiDirection>('rtl');
	let motion = $state<ZuiMotion>('reduced');
	const directions = [
		{ label: 'LTR', value: 'ltr' },
		{ label: 'RTL', value: 'rtl' }
	] as const;
	const motions = [
		{ label: 'Auto', value: 'auto' },
		{ label: 'Full', value: 'full' },
		{ label: 'Reduced', value: 'reduced' }
	] as const;

	function setDirection(value: SelectionKey): void {
		if (value === 'ltr' || value === 'rtl') direction = value;
	}

	function setMotion(value: SelectionKey): void {
		if (value === 'auto' || value === 'full' || value === 'reduced') motion = value;
	}
</script>

<ZStack gap="medium">
	<ZSegmented
		aria-label="文字方向"
		items={directions}
		onValueChange={setDirection}
		value={direction}
	/>
	<ZSegmented aria-label="动画偏好" items={motions} onValueChange={setMotion} value={motion} />
	<ZProvider {direction} {motion}>
		<ZDrawer>
			<ZDrawerTrigger variant="secondary">打开逻辑 start Drawer</ZDrawerTrigger>
			<ZDrawerOverlay />
			<ZDrawerContent placement="start" size="small">
				<ZStack gap="large">
					<ZDrawerTitle>偏好轴</ZDrawerTitle>
					<ZDrawerDescription>
						start随direction翻转；auto读取系统偏好，full强制保留动画，reduced立即完成退出。
					</ZDrawerDescription>
					<ZDrawerClose>关闭</ZDrawerClose>
				</ZStack>
			</ZDrawerContent>
		</ZDrawer>
	</ZProvider>
	<ZText tone="muted">direction = {direction} · motion = {motion}</ZText>
</ZStack>
