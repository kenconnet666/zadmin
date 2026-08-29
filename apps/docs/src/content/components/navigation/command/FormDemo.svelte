<script lang="ts">
	import { ZCommand, ZStack, ZText, type CommandActionEvent, type CommandItem } from '@zadmin/zui';

	const items: readonly CommandItem[] = [
		{ group: '导航', key: 'overview', keywords: ['home'], label: '打开概览', shortcut: 'G O' },
		{
			group: '导航',
			key: 'logs',
			keywords: ['observability'],
			label: '查看运行日志',
			shortcut: 'G L'
		},
		{
			description: '创建隔离预览',
			group: '部署',
			key: 'preview',
			keywords: ['deploy'],
			label: '部署预览环境',
			shortcut: 'D P'
		},
		{
			disabled: true,
			group: '部署',
			key: 'production',
			keywords: ['deploy'],
			label: '部署生产环境',
			shortcut: 'D R'
		}
	];
	let query = $state('');
	let action = $state('none');
	function handleAction(event: CommandActionEvent) {
		action = String(event.item.key);
	}
</script>

<ZStack gap="medium">
	<ZCommand
		bind:query
		inputLabel="搜索管理命令"
		listLabel="管理命令"
		onAction={handleAction}
		placeholder="搜索页面或操作"
		{items}
	/>
	<ZText tone="muted">query = {query || 'none'} · action = {action}</ZText>
</ZStack>
