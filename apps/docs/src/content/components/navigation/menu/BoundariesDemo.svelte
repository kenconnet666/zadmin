<script lang="ts">
	import { ZMenu, ZMenuItem, ZText } from '@zadmin/zui';
	let action = $state('none');
</script>

<ZMenu
	aria-label="不循环且可拦截的菜单"
	loop={false}
	onAction={(event) => {
		if (event.value === 'protected') event.preventDefault();
		else action = String(event.value);
	}}
>
	<ZMenuItem value="first">第一项（Home）</ZMenuItem>
	<ZMenuItem value="protected">受保护操作（被拦截）</ZMenuItem>
	<ZMenuItem value="last">最后一项（End）</ZMenuItem>
</ZMenu>
<ZText tone="muted">action = {action}</ZText>
