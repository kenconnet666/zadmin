<script lang="ts">
	import {
		ZCommandPalette,
		ZStack,
		ZText,
		type CommandActionEvent,
		type CommandItem
	} from '@zadmin/zui';

	const items: readonly CommandItem[] = [
		{
			group: '显示',
			key: 'theme',
			keywords: ['dark', 'light'],
			label: '切换主题',
			shortcut: '⌘ T'
		},
		{ group: '导航', key: 'docs', keywords: ['api'], label: '打开组件文档', shortcut: 'G D' },
		{ group: '操作', key: 'deploy', keywords: ['release'], label: '创建部署', shortcut: 'D P' }
	];
	let open = $state(false);
	let action = $state('none');
	function handleAction(event: CommandActionEvent) {
		action = String(event.item.key);
	}
</script>

<ZStack gap="medium">
	<ZCommandPalette
		bind:open
		closeLabel="关闭"
		description="搜索页面与生产操作。"
		inputLabel="搜索快捷命令"
		listLabel="快捷命令"
		onAction={handleAction}
		placeholder="输入命令"
		shortcut={{ key: 'k', modKey: true }}
		title="快速操作"
		triggerLabel="打开快速操作"
		{items}
	/>
	<ZText tone="muted">open = {open} · action = {action}</ZText>
</ZStack>
