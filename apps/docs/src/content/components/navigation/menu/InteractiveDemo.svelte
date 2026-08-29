<script lang="ts">
	import { ZMenu, ZMenuGroup, ZMenuItem, ZMenuLabel, ZMenuSeparator, ZText } from '@zadmin/zui';
	let action = $state('尚未选择');
</script>

<ZMenu aria-label="部署操作" onAction={(event) => (action = String(event.value))}>
	<ZMenuGroup aria-labelledby="menu-deployment-label">
		<ZMenuLabel id="menu-deployment-label">部署</ZMenuLabel>
		<ZMenuItem value="open">打开详情</ZMenuItem>
		<ZMenuItem value="duplicate">复制部署</ZMenuItem>
		<ZMenuItem disabled value="rollback">回滚（无可用版本）</ZMenuItem>
	</ZMenuGroup>
	<ZMenuSeparator />
	<ZMenuItem value="delete">删除部署</ZMenuItem>
</ZMenu>
<ZText tone="muted">action = {action}</ZText>
