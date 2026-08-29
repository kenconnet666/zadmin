<script lang="ts">
	import {
		ZDropdownMenu,
		ZDropdownMenuContent,
		ZDropdownMenuTrigger,
		ZMenuItem,
		ZMenuLabel,
		ZMenuSeparator,
		ZText
	} from '@zadmin/zui';
	let open = $state(false);
	let action = $state('尚未选择');
</script>

<ZDropdownMenu bind:open>
	<ZDropdownMenuTrigger data-testid="dropdown-menu-trigger" variant="secondary">
		部署操作
	</ZDropdownMenuTrigger>
	<ZDropdownMenuContent
		data-testid="dropdown-menu-content"
		onAction={(event) => (action = String(event.value))}
	>
		<ZMenuLabel>生产部署</ZMenuLabel>
		<ZMenuItem value="inspect">查看详情</ZMenuItem>
		<ZMenuItem value="duplicate">复制配置</ZMenuItem>
		<ZMenuSeparator />
		<ZMenuItem value="delete">删除部署</ZMenuItem>
	</ZDropdownMenuContent>
</ZDropdownMenu>
<ZText tone="muted">open = {open} · action = {action}</ZText>
