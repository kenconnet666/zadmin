<script lang="ts">
	import {
		ZDrawer,
		ZDrawerClose,
		ZDrawerContent,
		ZDrawerDescription,
		ZDrawerOverlay,
		ZDrawerTitle,
		ZDrawerTrigger,
		ZInput,
		ZSegmented,
		ZStack,
		ZText,
		type DrawerPlacement,
		type SelectionKey
	} from '@zadmin/zui';

	let open = $state(false);
	let placement = $state<DrawerPlacement>('end');
	const placements = [
		{ label: 'start', value: 'start' },
		{ label: 'end', value: 'end' },
		{ label: 'top', value: 'top' },
		{ label: 'bottom', value: 'bottom' }
	] as const;
	function setPlacement(value: SelectionKey): void {
		if (value === 'start' || value === 'end' || value === 'top' || value === 'bottom') {
			placement = value;
		}
	}
</script>

<ZStack gap="medium">
	<ZText weight="semibold">逻辑方向</ZText>
	<ZSegmented
		aria-label="Drawer逻辑方向"
		items={placements}
		onValueChange={setPlacement}
		value={placement}
	/>
	<ZDrawer bind:open>
		<ZDrawerTrigger data-testid="drawer-trigger" variant="secondary">打开部署面板</ZDrawerTrigger>
		<ZDrawerOverlay data-testid="drawer-overlay" />
		<ZDrawerContent data-testid="drawer-content" {placement} size="medium">
			<ZStack gap="large">
				<ZDrawerTitle>部署设置</ZDrawerTitle>
				<ZDrawerDescription>逻辑start/end会随RTL方向自动翻转。</ZDrawerDescription>
				<ZInput aria-label="发布通道" id="drawer-channel" name="channel" value="production" />
				<ZDrawerClose data-testid="drawer-close" variant="secondary">保存并关闭</ZDrawerClose>
			</ZStack>
		</ZDrawerContent>
	</ZDrawer>
	<ZText tone="muted">placement = {placement} · open = {open}</ZText>
</ZStack>
