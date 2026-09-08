<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		ZButton,
		ZProvider,
		ZStack,
		ZText,
		ZTransfer,
		type SelectionKey,
		type TransferItem,
		type TransferMoveRequest,
		type ZuiMotion
	} from '@zadmin/zui';

	type PendingMove = {
		onAbort: () => void;
		reject: (error: Error) => void;
		request: TransferMoveRequest;
		resolve: (accepted: boolean) => void;
	};

	const initialItems: readonly TransferItem[] = [
		{ description: '稳定发布', key: 'stable', label: '稳定集群' },
		{ description: '候选发布', key: 'candidate', label: '候选集群' },
		{ description: '灾备资源', key: 'backup', label: '灾备集群' }
	];
	const defaultValue: readonly SelectionKey[] = ['stable'];
	const motionChoices = ['auto', 'full', 'reduced'] as const satisfies readonly ZuiMotion[];
	let items = $state<readonly TransferItem[]>(initialItems);
	let value = $state<readonly SelectionKey[]>(defaultValue);
	let pending = $state.raw<PendingMove | null>(null);
	let status = $state('等待移动请求');
	let form = $state<HTMLFormElement | null>(null);
	let formDataValue = $state('尚未提交');
	let revision = $state(0);
	let motion = $state<ZuiMotion>('auto');

	function clearPending(nextStatus: string): void {
		const current = pending;
		if (!current) return;
		current.request.signal.removeEventListener('abort', current.onAbort);
		pending = null;
		status = nextStatus;
		current.resolve(false);
	}

	function handleMove(request: TransferMoveRequest): Promise<boolean> {
		if (pending || request.signal.aborted) return Promise.resolve(false);
		return new Promise<boolean>((resolve, reject) => {
			const onAbort = () => {
				if (pending?.request !== request) return;
				clearPending('请求已取消');
			};
			request.signal.addEventListener('abort', onAbort, { once: true });
			pending = { onAbort, reject, request, resolve };
			status = `等待外部确认：${request.source}→${request.destination} · ${request.movingKeys.join(', ') || '无项目'}`;
		});
	}

	function accept(): void {
		const current = pending;
		if (!current) return;
		current.request.signal.removeEventListener('abort', current.onAbort);
		pending = null;
		value = current.request.nextValue;
		status = 'owner已写入nextValue，等待组件核对接受结果';
		current.resolve(true);
	}

	function rejectMove(): void {
		const current = pending;
		if (!current) return;
		current.request.signal.removeEventListener('abort', current.onAbort);
		pending = null;
		status = '已拒绝；owner保留原value';
		current.resolve(false);
	}

	function errorMove(): void {
		const current = pending;
		if (!current) return;
		current.request.signal.removeEventListener('abort', current.onAbort);
		pending = null;
		status = '模拟错误；onMoveEnd将收到error';
		current.reject(new Error('Transfer request owner rejected the simulated operation.'));
	}

	function clearValue(): void {
		value = [];
		status = 'owner外部清空value；组件核对待决快照并终止过期请求';
	}

	function replaceItems(): void {
		revision += 1;
		items = revision % 2 === 0 ? initialItems : initialItems.toReversed();
		status = `owner替换items顺序（第${revision}次）；组件终止过期请求`;
	}

	function submit(): void {
		if (!form) return;
		formDataValue = JSON.stringify(new FormData(form).getAll('cluster'));
	}

	onDestroy(() => {
		const current = pending;
		if (!current) return;
		current.request.signal.removeEventListener('abort', current.onAbort);
		current.resolve(false);
		pending = null;
	});
</script>

<form
	bind:this={form}
	onsubmit={(event) => {
		event.preventDefault();
		submit();
	}}
>
	<ZStack gap="small">
		<ZStack direction="row" gap="small" wrap>
			{#each motionChoices as choice (choice)}
				<ZButton
					aria-pressed={motion === choice}
					variant={motion === choice ? 'solid' : 'outline'}
					onclick={() => (motion = choice)}>动画：{choice}</ZButton
				>
			{/each}
		</ZStack>
		<ZText data-testid="transfer-motion-state" tone="muted">motion={motion}</ZText>
		<ZProvider {motion}>
			<ZTransfer
				aria-label="需要外部确认的发布通道转移"
				bind:value
				{defaultValue}
				dragDrop
				{items}
				moveMode="request"
				name="cluster"
				onMoveEnd={(detail) =>
					(status = `移动结果：${detail.result} · source=${detail.request.source}`)}
				onMoveRequest={handleMove}
				sourceTitle="可请求移动"
				targetTitle="已确认移动"
			/>
		</ZProvider>
		<ZStack direction="row" gap="small" wrap>
			<ZButton type="button" variant="outline" disabled={!pending} onclick={accept}
				>接受请求</ZButton
			>
			<ZButton type="button" variant="outline" disabled={!pending} onclick={rejectMove}
				>拒绝请求</ZButton
			>
			<ZButton type="button" variant="outline" disabled={!pending} onclick={errorMove}
				>模拟错误</ZButton
			>
			<ZButton type="button" variant="ghost" onclick={clearValue}>Owner清空value</ZButton>
			<ZButton type="button" variant="ghost" onclick={replaceItems}>Owner替换items</ZButton>
		</ZStack>
		<ZStack direction="row" gap="small" wrap>
			<ZButton type="submit">读取原生FormData</ZButton>
			<ZButton type="reset" variant="outline">Reset</ZButton>
		</ZStack>
		<ZText data-testid="transfer-request-status" tone="muted">
			{status} · value={value.join(',') || '[]'} · FormData={formDataValue} · 启用dragDrop后支持pointer跨栏，listbox也支持Alt+方向键快捷跨栏；接受前不预写canonical。本演示验证pointer/keyboard与motion策略，CDP拖放和真实touch仍待后续验收。
		</ZText>
	</ZStack>
</form>
