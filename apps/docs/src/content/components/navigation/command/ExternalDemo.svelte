<script lang="ts">
	import { ZCommand, ZStack, ZText, type CommandItem } from '@zadmin/zui';

	const sourceItems: readonly CommandItem[] = [
		{ key: 'audit', label: '运行系统审计' },
		{ key: 'deploy', label: '创建部署' },
		{ key: 'docs', label: '打开组件文档' },
		{ key: 'logs', label: '查看运行日志' }
	];
	let query = $state('');
	const items = $derived(
		sourceItems
			.filter((item) => item.label.includes(query.trim()))
			.toSorted((left, right) => right.label.localeCompare(left.label, 'zh-CN'))
	);
</script>

<ZStack gap="medium">
	<ZCommand
		bind:query
		emptyText="外部结果为空"
		inputLabel="外部过滤命令"
		{items}
		listLabel="外部排序结果"
		shouldFilter={false}
	/>
	<ZText tone="muted"
		>query = {query || '空'} · 外部结果 = {items.map((item) => item.key).join(',')}</ZText
	>
</ZStack>
