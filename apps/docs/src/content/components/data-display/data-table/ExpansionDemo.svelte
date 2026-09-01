<script lang="ts">
	import { ZDataTable, ZDescriptionList, ZStack, ZText, type DataTableColumn } from '@zadmin/zui';

	interface AuditRow {
		actor: string;
		detail: string;
		id: string;
		result: string;
		time: string;
	}

	const rows: readonly AuditRow[] = [
		{
			actor: '自动发布',
			detail: '从构建 8421 发布 docs 到 production，并通过健康检查。',
			id: 'evt-1',
			result: '成功',
			time: '10:24'
		},
		{
			actor: 'lionheart',
			detail: '更新 API Gateway 的速率限制策略，需要人工复核。',
			id: 'evt-2',
			result: '待复核',
			time: '10:16'
		},
		{
			actor: '巡检任务',
			detail: '归档三十天前的调试日志。',
			id: 'evt-3',
			result: '成功',
			time: '09:58'
		}
	];
	const columns = [
		{ id: 'time', header: '时间', accessor: (row: AuditRow) => row.time, width: 100 },
		{ id: 'actor', header: '操作者', accessor: (row: AuditRow) => row.actor, width: 160 },
		{ id: 'result', header: '结果', accessor: (row: AuditRow) => row.result, width: 120 }
	] satisfies readonly DataTableColumn<AuditRow>[];
	let expandedKeys = $state<readonly string[]>(['evt-1']);
</script>

{#snippet expandedRow(row: AuditRow, index: number)}
	<ZDescriptionList
		aria-label={`${row.actor}事件详情`}
		items={[
			{ key: 'position', term: '全局位置', description: `第 ${index + 1} 条` },
			{ key: 'detail', term: '详情', description: row.detail }
		]}
	/>
{/snippet}

<ZStack gap="medium">
	<ZText aria-live="polite" tone="muted">expanded = {expandedKeys.join(', ') || 'none'}</ZText>
	<ZDataTable
		caption="审计事件"
		{columns}
		{expandedRow}
		{rows}
		rowKey={(row) => row.id}
		expansionLabel={(row, expanded) => `${expanded ? '收起' : '展开'} ${row.actor} 的事件详情`}
		bind:expandedKeys
	/>
</ZStack>
