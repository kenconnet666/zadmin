<script lang="ts">
	import {
		ZDropdownMenu,
		ZDropdownMenuContent,
		ZDropdownMenuTrigger,
		ZMenuItem,
		ZText
	} from '@zadmin/zui';
	let open = $state(false);
</script>

<ZDropdownMenu bind:open placement="top-end">
	<ZDropdownMenuTrigger variant="secondary">向上打开</ZDropdownMenuTrigger>
	<ZDropdownMenuContent loop={false}>
		<ZMenuItem value="first">第一项</ZMenuItem>
		<ZMenuItem value="last">最后一项</ZMenuItem>
		<ZMenuItem disabled value="locked">锁定项</ZMenuItem>
	</ZDropdownMenuContent>
</ZDropdownMenu>
<ZText tone="muted">open = {open} · loop = false · placement = top-end</ZText>
