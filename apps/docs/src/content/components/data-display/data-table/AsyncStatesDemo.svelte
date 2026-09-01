<script lang="ts">
	import { ZAlert, ZButton, ZDataTable, ZStack, type DataTableColumn } from '@zadmin/zui';

	type ViewState = 'empty' | 'error' | 'loading' | 'ready';
	interface ServiceRow {
		id: string;
		name: string;
		status: string;
	}

	const rows: readonly ServiceRow[] = [
		{ id: 'api', name: 'API Gateway', status: '在线' },
		{ id: 'docs', name: 'Docs', status: '发布中' }
	];
	const columns = [
		{ id: 'name', header: '服务', accessor: (row: ServiceRow) => row.name },
		{ id: 'status', header: '状态', accessor: (row: ServiceRow) => row.status }
	] satisfies readonly DataTableColumn<ServiceRow>[];
	const states = [
		{ id: 'ready', label: '就绪' },
		{ id: 'loading', label: '保留旧数据加载' },
		{ id: 'empty', label: '空数据' },
		{ id: 'error', label: '错误' }
	] as const;
	let state = $state<ViewState>('ready');
</script>

{#snippet errorContent(message: string)}
	<ZAlert live="assertive" title={message} tone="danger">
		表格保留已成功的数据快照；请求层决定何时重试或替换rows。
		{#snippet action()}
			<ZButton size="small" variant="secondary" onclick={() => (state = 'loading')}>重试</ZButton>
		{/snippet}
	</ZAlert>
{/snippet}

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		{#each states as option (option.id)}
			<ZButton
				size="small"
				variant={state === option.id ? 'primary' : 'secondary'}
				onclick={() => (state = option.id)}>{option.label}</ZButton
			>
		{/each}
	</ZStack>
	<ZDataTable
		caption="服务状态"
		{columns}
		emptyLabel="没有符合条件的服务"
		error={state === 'error' ? '服务列表加载失败' : null}
		{errorContent}
		loading={state === 'loading'}
		loadingLabel="正在刷新服务列表"
		rows={state === 'empty' ? [] : rows}
		rowKey={(row) => row.id}
	/>
</ZStack>
