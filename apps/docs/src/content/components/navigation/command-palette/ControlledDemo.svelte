<script lang="ts">
	import { ZButton, ZCommandPalette, ZStack, ZText, type CommandActionEvent } from '@zadmin/zui';

	const items = [
		{ key: 'deploy', label: '部署生产环境', keywords: ['release'] },
		{ key: 'inspect', label: '继续检查策略', keywords: ['policy'] }
	];
	let open = $state(false);
	let query = $state('deploy');
	let openChanges = $state(0);
	let queryChanges = $state(0);
	let action = $state('none');

	function handleAction(event: CommandActionEvent): void {
		action = String(event.item.key);
		if (event.item.key === 'inspect') event.preventDefault();
	}
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton variant="secondary" onclick={() => (open = true)}>由owner打开</ZButton>
		<ZButton variant="secondary" onclick={() => (query = '')}>由owner清空查询</ZButton>
	</ZStack>
	<ZCommandPalette
		bind:open
		bind:query
		{items}
		onAction={handleAction}
		onOpenChange={() => (openChanges += 1)}
		onQueryChange={() => (queryChanges += 1)}
		resetQueryOnClose={false}
		title="受控发布命令"
		triggerLabel="打开受控发布命令"
	/>
	<ZText tone="muted">
		open = {open} · query = {query || 'empty'} · action = {action} · open changes = {openChanges} · query
		changes = {queryChanges}
	</ZText>
</ZStack>
