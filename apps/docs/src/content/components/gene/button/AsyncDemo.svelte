<script lang="ts">
	import { onDestroy } from 'svelte';
	import { ZButton, ZIcon, ZStack, ZText } from '@zadmin/zui';

	let pending = $state(false);
	let simulation = $state<'success' | 'failure'>('success');
	let result = $state('尚未运行模拟任务');
	let resultTone = $state<'muted' | 'success' | 'danger'>('muted');
	let button = $state<HTMLButtonElement | null>(null);
	let timer: { id: number; view: Window } | undefined;
	let abortController: AbortController | undefined;
	let runId = 0;
	let disposed = false;

	function clearRun(): void {
		runId += 1;
		if (timer) {
			timer.view.clearTimeout(timer.id);
			timer = undefined;
		}
		if (abortController) {
			abortController.abort();
			abortController = undefined;
		}
	}

	function runSimulation(): void {
		if (pending || disposed) return;
		const view = button?.ownerDocument.defaultView;
		if (!view) {
			result = '模拟任务无法启动：按钮没有ownerWindow，请重试';
			resultTone = 'danger';
			return;
		}
		clearRun();
		pending = true;
		resultTone = 'muted';
		const outcome = simulation;
		result = `模拟任务进行中（${outcome === 'success' ? '成功' : '失败'}），按钮会阻止重复提交`;
		const currentRun = runId;
		const controller = new AbortController();
		const signal = controller.signal;
		abortController = controller;
		const onAbort = () => {
			view.clearTimeout(id);
		};
		signal.addEventListener('abort', onAbort, { once: true });
		const id = view.setTimeout(() => {
			signal.removeEventListener('abort', onAbort);
			if (disposed || signal.aborted || currentRun !== runId) return;
			pending = false;
			resultTone = outcome === 'success' ? 'success' : 'danger';
			result =
				outcome === 'success'
					? '模拟任务成功：已完成本地演示，可再次运行'
					: '模拟任务失败：服务端拒绝（本地模拟），可重试';
			timer = undefined;
			abortController = undefined;
		}, 900);
		timer = { id, view };
	}

	onDestroy(() => {
		disposed = true;
		clearRun();
	});
</script>

{#snippet saveIcon()}
	<ZIcon name="check" />
{/snippet}

<ZStack gap="small" align="start">
	<ZStack direction="row" gap="small" wrap>
		<ZButton
			aria-pressed={simulation === 'success'}
			data-testid="button-async-success"
			onclick={() => (simulation = 'success')}
			variant={simulation === 'success' ? 'solid' : 'outline'}>模拟成功</ZButton
		>
		<ZButton
			aria-pressed={simulation === 'failure'}
			data-testid="button-async-failure"
			onclick={() => (simulation = 'failure')}
			variant={simulation === 'failure' ? 'solid' : 'outline'}>模拟失败</ZButton
		>
	</ZStack>
	<ZButton
		aria-label="运行模拟任务"
		bind:ref={button}
		data-testid="button-async-run"
		loading={pending}
		loadingLabel="正在运行模拟任务"
		start={saveIcon}
		onclick={runSimulation}
	>
		运行模拟任务
	</ZButton>
	<ZText aria-live="polite" role="status" tone={resultTone}>{result}（不访问网络）</ZText>
</ZStack>
