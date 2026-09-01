<script lang="ts">
	import {
		ZDropdownMenu,
		ZDropdownMenuContent,
		ZDropdownMenuTrigger,
		ZMenuItem,
		ZMenuSub,
		ZMenuSubContent,
		ZMenuSubTrigger,
		ZText
	} from '@zadmin/zui';
	let action = $state('none');
</script>

<ZDropdownMenu>
	<ZDropdownMenuTrigger variant="secondary">分享</ZDropdownMenuTrigger>
	<ZDropdownMenuContent onAction={(event) => (action = String(event.value))}>
		<ZMenuItem value="copy">复制链接</ZMenuItem>
		<ZMenuSub>
			<ZMenuSubTrigger value="send">发送到</ZMenuSubTrigger>
			<ZMenuSubContent>
				<ZMenuItem value="mail">邮件</ZMenuItem>
				<ZMenuItem value="team">团队空间</ZMenuItem>
			</ZMenuSubContent>
		</ZMenuSub>
	</ZDropdownMenuContent>
</ZDropdownMenu>
<ZText tone="muted">action = {action}</ZText>
