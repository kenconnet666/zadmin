<script lang="ts">
	import { ZButton, ZMenu, ZMenuItem, ZStack, ZText } from '@zadmin/zui';
	let showMiddle = $state(true);
	let action = $state('none');
</script>

<ZStack gap="medium">
	<ZButton size="small" variant="secondary" onclick={() => (showMiddle = !showMiddle)}>
		{showMiddle ? '移除中间项' : '恢复中间项'}
	</ZButton>
	<ZMenu aria-label="动态菜单" loop={false} onAction={(event) => (action = String(event.value))}>
		<ZMenuItem value="first" shortcut="Home">第一项</ZMenuItem>
		{#if showMiddle}<ZMenuItem value="middle">动态中间项</ZMenuItem>{/if}
		<ZMenuItem value="last" shortcut="End">最后一项</ZMenuItem>
		<ZMenuItem
			href="https://www.w3.org/WAI/ARIA/apg/patterns/menubar/"
			rel="noreferrer"
			target="_blank"
			value="apg"
		>
			WAI-ARIA APG
		</ZMenuItem>
	</ZMenu>
	<ZText tone="muted">action = {action}</ZText>
</ZStack>
