<script lang="ts">
	import {
		ZContextMenu,
		ZContextMenuContent,
		ZContextMenuTrigger,
		ZMenuItem,
		ZText
	} from '@zadmin/zui';
	let action = $state('none');
</script>

<ZContextMenu>
	<ZContextMenuTrigger><ZText>在只读部署区域右键或按Shift+F10。</ZText></ZContextMenuTrigger>
	<ZContextMenuContent
		ariaLabel="只读部署菜单"
		loop={false}
		onAction={(event) => (action = String(event.value))}
	>
		<ZMenuItem value="inspect">查看详情</ZMenuItem>
		<ZMenuItem value="copy">复制链接</ZMenuItem>
		<ZMenuItem disabled value="delete">删除（只读）</ZMenuItem>
	</ZContextMenuContent>
</ZContextMenu>
<ZText tone="muted">action = {action}</ZText>
