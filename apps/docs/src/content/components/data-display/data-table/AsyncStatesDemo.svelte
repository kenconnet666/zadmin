<script lang="ts">
	import {
		ZAlert,
		ZButton,
		ZDataTable,
		ZSkeleton,
		ZStack,
		type DataTableColumn
	} from '@zadmin/zui';

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
		{ id: 'loading', label: '加载' },
		{ id: 'empty', label: '空数据' },
		{ id: 'error', label: '错误' }
	] as const;
	let state = $state<ViewState>('ready');
</script>

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

	{#if state === 'loading'}
		<ZStack aria-busy="true" aria-label="正在加载服务列表" gap="small">
			{#each [1, 2, 3] as row (row)}
				<ZSkeleton height={44} shape="rectangle" />
			{/each}
		</ZStack>
	{:else if state === 'error'}
		<ZAlert live="assertive" title="服务列表加载失败" tone="danger">
			请求状态和重试动作由页面的数据请求层持有，表格不吞掉错误。
			{#snippet action()}
				<ZButton size="small" variant="secondary" onclick={() => (state = 'loading')}>重试</ZButton>
			{/snippet}
		</ZAlert>
	{:else}
		<ZDataTable
			caption="服务状态"
			{columns}
			emptyLabel="没有符合条件的服务"
			rows={state === 'empty' ? [] : rows}
			rowKey={(row) => row.id}
		/>
	{/if}
</ZStack>
