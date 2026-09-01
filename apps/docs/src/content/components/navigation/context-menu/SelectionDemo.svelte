<script lang="ts">
	import {
		ZContextMenu,
		ZContextMenuContent,
		ZContextMenuTrigger,
		ZMenuCheckboxItem,
		ZMenuRadioGroup,
		ZMenuRadioItem,
		ZMenuSeparator,
		ZText
	} from '@zadmin/zui';
	let pinned = $state(false);
	let color = $state('blue');
</script>

<ZContextMenu>
	<ZContextMenuTrigger><ZText>在卡片上打开上下文菜单并调整视图状态。</ZText></ZContextMenuTrigger>
	<ZContextMenuContent aria-label="卡片视图设置">
		<ZMenuCheckboxItem bind:checked={pinned} value="pinned">固定卡片</ZMenuCheckboxItem>
		<ZMenuSeparator />
		<ZMenuRadioGroup aria-label="标签颜色" bind:value={color}>
			<ZMenuRadioItem value="blue">蓝色标签</ZMenuRadioItem>
			<ZMenuRadioItem value="green">绿色标签</ZMenuRadioItem>
		</ZMenuRadioGroup>
	</ZContextMenuContent>
</ZContextMenu>
<ZText tone="muted">pinned = {pinned} · color = {color}</ZText>
