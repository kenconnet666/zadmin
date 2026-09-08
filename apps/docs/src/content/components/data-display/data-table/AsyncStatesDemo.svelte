<script lang="ts">
	import { ZAlert, ZButton, ZDataTable, ZStack, ZText, type DataTableColumn } from '@zadmin/zui';
	import { AsyncCollectionQuery } from '@zadmin/zui/runtime';

	type SimulatedRequest = 'empty' | 'failure' | 'refresh' | 'slow' | 'success';

	interface ServiceRow {
		id: string;
		name: string;
		status: string;
	}

	const initialRows: readonly ServiceRow[] = [
		{ id: 'api', name: 'API Gateway', status: '在线' },
		{ id: 'docs', name: 'Docs', status: '发布中' }
	];
	const refreshedRows: readonly ServiceRow[] = [
		{ id: 'api', name: 'API Gateway', status: '在线' },
		{ id: 'docs', name: 'Docs', status: '已发布' },
		{ id: 'worker', name: 'Async Worker', status: '已恢复' }
	];
	const slowRows: readonly ServiceRow[] = [
		{ id: 'old', name: '旧版本慢响应', status: '不应覆盖后发结果' }
	];
	const columns = [
		{ id: 'name', header: '服务', accessor: (row: ServiceRow) => row.name },
		{ id: 'status', header: '状态', accessor: (row: ServiceRow) => row.status }
	] satisfies readonly DataTableColumn<ServiceRow>[];

	function simulatedService(
		request: SimulatedRequest,
		signal: AbortSignal
	): Promise<readonly ServiceRow[]> {
		const delay = request === 'slow' ? 900 : 280;
		return new Promise((resolve, reject) => {
			const finish = () => {
				signal.removeEventListener('abort', abort);
				if (request === 'failure') {
					reject(new Error('模拟服务在固定响应时间后失败。'));
					return;
				}
				resolve(request === 'empty' ? [] : request === 'slow' ? slowRows : refreshedRows);
			};
			const timer = window.setTimeout(finish, delay);
			const abort = () => {
				window.clearTimeout(timer);
				signal.removeEventListener('abort', abort);
				reject(signal.reason ?? new Error('模拟请求已取消。'));
			};
			if (signal.aborted) abort();
			else signal.addEventListener('abort', abort, { once: true });
		});
	}

	const query = new AsyncCollectionQuery<SimulatedRequest, readonly ServiceRow[]>(
		(request, context) => simulatedService(request, context.signal)
	);
	let queryState = $state(query.state);
	let lastAction = $state('初始快照由外部 owner 提供。');
	const unsubscribe = query.subscribe((state) => (queryState = state));
	$effect(() => () => {
		unsubscribe();
		query.dispose();
	});
	const rows = $derived(queryState.data ?? initialRows);
	const statusText = $derived(
		queryState.status === 'success'
			? `模拟请求已完成，当前快照包含 ${rows.length} 条数据。`
			: queryState.status === 'error'
				? '模拟请求失败；先前的成功快照保持不变，可重试。'
				: lastAction
	);

	function request(next: SimulatedRequest): void {
		lastAction =
			next === 'refresh'
				? '正在刷新：表格保留旧快照。'
				: next === 'empty'
					? '正在请求一个确定性的空结果。'
					: next === 'failure'
						? '正在请求一个确定性的失败结果。'
						: next === 'slow'
							? '慢请求已启动；可用后发成功请求覆盖它。'
							: '后发成功请求已启动；它会覆盖任何较早请求。';
		void query.load(next);
	}

	function cancel(): void {
		query.cancel();
		lastAction = '已取消当前模拟请求；旧快照保持不变。';
	}
</script>

{#snippet errorContent()}
	<ZAlert live="assertive" title="模拟服务请求失败" tone="danger">
		旧数据快照没有被表格改写；重试、取消和请求覆盖仍由外部 owner 决定。
		{#snippet action()}
			<ZButton size="small" variant="outline" onclick={() => request('success')}>重试并成功</ZButton
			>
		{/snippet}
	</ZAlert>
{/snippet}

<ZStack gap="medium">
	<ZText tone="muted">
		模拟服务（不发起外网请求）· status = {queryState.status} · generation = {queryState.generation} ·
		当前快照 = {rows.length}
	</ZText>
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="outline" onclick={() => request('refresh')}
			>保留旧数据刷新</ZButton
		>
		<ZButton size="small" variant="outline" onclick={() => request('empty')}>返回空结果</ZButton>
		<ZButton size="small" variant="outline" onclick={() => request('failure')}
			>模拟确定性失败</ZButton
		>
		<ZButton disabled={!queryState.loading} size="small" variant="outline" onclick={cancel}
			>取消当前请求</ZButton
		>
		<ZButton size="small" variant="outline" onclick={() => request('slow')}>启动慢请求</ZButton>
		<ZButton size="small" variant="outline" onclick={() => request('success')}
			>后发成功请求覆盖前发请求</ZButton
		>
	</ZStack>
	<ZText aria-live="polite" tone="muted">{statusText}</ZText>
	<ZDataTable
		caption="服务状态"
		{columns}
		emptyLabel="没有符合条件的服务"
		error={queryState.error ? '模拟服务加载失败' : null}
		{errorContent}
		loading={queryState.loading}
		loadingLabel="模拟服务响应中，保留当前数据"
		{rows}
		rowKey={(row) => row.id}
	/>
</ZStack>
