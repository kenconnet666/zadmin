<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		ZBadge,
		ZDataTable,
		ZStack,
		ZText,
		type DataTableColumn,
		type SelectionKey
	} from '@zadmin/zui';

	interface ServiceRow {
		description: string;
		id: string;
		locked?: boolean;
		name: string;
		owner: string;
		status: '发布中' | '在线';
	}

	const rows: readonly ServiceRow[] = [
		{
			description: '统一承载外部与内部管理接口。',
			id: 'api',
			name: 'API',
			owner: '平台组',
			status: '在线'
		},
		{
			description: '较长文本会在固定列宽内自然换行，用于验证真实内容密度。',
			id: 'docs',
			name: '文档站',
			owner: '体验组',
			status: '发布中'
		},
		{
			description: '系统保留任务，当前行不可选择。',
			id: 'worker',
			locked: true,
			name: 'Worker',
			owner: '数据组',
			status: '在线'
		}
	];
	function createColumns(
		statusCell: Snippet<[ServiceRow, unknown]>
	): readonly DataTableColumn<ServiceRow>[] {
		return [
			{ id: 'name', header: '服务', accessor: (row) => row.name, sortable: true, width: 140 },
			{ id: 'owner', header: '负责人', accessor: (row) => row.owner, width: 120 },
			{
				id: 'description',
				header: '说明',
				accessor: (row) => row.description,
				width: '45%'
			},
			{
				id: 'status',
				header: '状态',
				accessor: (row) => row.status,
				cell: statusCell,
				width: 110
			}
		];
	}
	let selectedKeys = $state<readonly SelectionKey[]>(['docs']);
</script>

{#snippet statusCell(row: ServiceRow, _value: unknown)}
	<ZBadge tone={row.status === '在线' ? 'success' : 'warning'}>{row.status}</ZBadge>
{/snippet}

<ZStack gap="medium">
	<ZText aria-live="polite" tone="muted">selected = {selectedKeys.join(', ') || 'none'}</ZText>
	<ZDataTable
		caption="紧凑服务清单"
		columns={createColumns(statusCell)}
		density="compact"
		isRowDisabled={(row) => Boolean(row.locked)}
		{rows}
		rowKey={(row) => row.id}
		selectAllLabel="选择全部可操作服务"
		selectionLabel={(row) => row.locked ? `${row.name}不可选择` : `选择${row.name}`}
		selectionMode="multiple"
		bind:selectedKeys
	/>
</ZStack>
