<script lang="ts">
	import {
		ZContextMenu,
		ZContextMenuContent,
		ZContextMenuTrigger,
		ZMenuItem,
		ZText
	} from '@zadmin/zui';
	let open = $state(false);
	let action = $state('尚未选择');
</script>

<ZContextMenu bind:open>
	<ZContextMenuTrigger data-testid="context-menu-trigger">
		<ZText>在这个部署卡片上右键，或聚焦后按Shift+F10。</ZText>
	</ZContextMenuTrigger>
	<ZContextMenuContent
		aria-label="部署上下文菜单"
		data-testid="context-menu-content"
		onAction={(event) => (action = String(event.value))}
	>
		<ZMenuItem value="inspect">查看详情</ZMenuItem>
		<ZMenuItem value="copy">复制标识</ZMenuItem>
		<ZMenuItem value="delete">删除部署</ZMenuItem>
	</ZContextMenuContent>
</ZContextMenu>
<ZText tone="muted">open = {open} · action = {action}</ZText>
