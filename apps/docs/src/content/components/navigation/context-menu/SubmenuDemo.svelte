<script lang="ts">
	import {
		ZContextMenu,
		ZContextMenuContent,
		ZContextMenuTrigger,
		ZMenuItem,
		ZMenuSub,
		ZMenuSubContent,
		ZMenuSubTrigger,
		ZText
	} from '@zadmin/zui';
	let action = $state('none');
</script>

<ZContextMenu>
	<ZContextMenuTrigger><ZText>右键或按Shift+F10移动部署。</ZText></ZContextMenuTrigger>
	<ZContextMenuContent aria-label="移动部署" onAction={(event) => (action = String(event.value))}>
		<ZMenuItem value="duplicate">创建副本</ZMenuItem>
		<ZMenuSub>
			<ZMenuSubTrigger value="move">移动到</ZMenuSubTrigger>
			<ZMenuSubContent>
				<ZMenuItem value="production">生产环境</ZMenuItem>
				<ZMenuItem value="staging">预发布环境</ZMenuItem>
			</ZMenuSubContent>
		</ZMenuSub>
	</ZContextMenuContent>
</ZContextMenu>
<ZText tone="muted">action = {action}</ZText>
