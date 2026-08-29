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
		ZStack,
		ZText,
		type DrawerPlacement
	} from '@zadmin/zui';

	let open = $state(false);
	let placement = $state<DrawerPlacement>('end');
</script>

<ZStack gap="medium">
	<label for="drawer-placement">逻辑方向</label>
	<select id="drawer-placement" name="drawer-placement" bind:value={placement}>
		<option value="end">end</option>
		<option value="start">start</option>
		<option value="top">top</option>
		<option value="bottom">bottom</option>
	</select>
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
