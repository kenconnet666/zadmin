<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		ZButton,
		ZCheckbox,
		ZDataTable,
		ZStack,
		ZTag,
		ZText,
		type DataTableColumn,
		type DataTableColumnVisibility,
		type DataTableColumnWidths,
		type ZDataTableController
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
			description:
				'这一段很长的说明用于验证固定宽度、横向滚动和ellipsis不会破坏原生表格的可访问文本。',
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
		statusCell: Snippet<[ServiceRow, unknown, number]>
	): readonly DataTableColumn<ServiceRow>[] {
		return [
			{
				id: 'name',
				header: '服务',
				accessor: (row) => row.name,
				sortable: true,
				sticky: 'start',
				width: 150
			},
			{
				id: 'owner',
				header: '负责人',
				accessor: (row) => row.owner,
				defaultHidden: true,
				width: 130
			},
			{
				id: 'description',
				header: '说明',
				accessor: (row) => row.description,
				ellipsis: true,
				minWidth: 180,
				maxWidth: 520,
				resizable: true,
				width: 300
			},
			{
				id: 'status',
				header: '状态',
				accessor: (row) => row.status,
				cell: statusCell,
				sticky: 'end',
				width: 120
			}
		];
	}
	let columnVisibility = $state<DataTableColumnVisibility>({});
	let columnWidths = $state<DataTableColumnWidths>({});
	let controller = $state<ZDataTableController<string> | null>(null);
</script>

{#snippet statusCell(row: ServiceRow, _value: unknown, _index: number)}
	<ZTag tone={row.status === '在线' ? 'success' : 'warning'}>{row.status}</ZTag>
{/snippet}

<ZStack gap="medium">
	<ZStack direction="row" gap="medium" wrap>
		<label>
			<ZCheckbox
				checked={columnVisibility.owner ?? false}
				onCheckedChange={(checked) => controller?.setColumnVisible('owner', checked === true)}
			/>
			显示负责人列
		</label>
		<ZButton size="small" variant="secondary" onclick={() => controller?.resetColumnWidths()}
			>重置列宽</ZButton
		>
	</ZStack>
	<ZText aria-live="polite" tone="muted">
		visible = {controller?.visibleColumnIds.join(', ') ?? '准备中'} · description width =
		{columnWidths.description ?? 300}px
	</ZText>
	<ZDataTable
		caption="可定制服务清单"
		columns={createColumns(statusCell)}
		density="compact"
		isRowDisabled={(row) => Boolean(row.locked)}
		{rows}
		rowKey={(row) => row.id}
		selectAllLabel="选择全部可操作服务"
		selectionLabel={(row) => (row.locked ? `${row.name}不可选择` : `选择${row.name}`)}
		selectionMode="multiple"
		stickyHeader
		bind:columnVisibility
		bind:columnWidths
		bind:controller
	/>
</ZStack>
