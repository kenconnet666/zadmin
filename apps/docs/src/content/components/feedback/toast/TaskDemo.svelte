<script lang="ts">
	import { createToastQueue, ZButton, ZStack, ZText, ZToaster } from '@zadmin/zui';
	import { onDestroy } from 'svelte';

	const queue = createToastQueue();
	const taskId = 'release-task';
	let controller: AbortController | undefined;
	const controllers = new Set<AbortController>();
	let runs = $state(0);
	const current = $derived(queue.items.find((item) => item.id === taskId));

	function delayedResult(
		ownerWindow: Window,
		label: string,
		delay: number,
		signal: AbortSignal,
		fail = false
	): Promise<string> {
		return new Promise((resolve, reject) => {
			let settled = false;
			const finish = (settle: () => void): void => {
				if (settled) return;
				settled = true;
				ownerWindow.clearTimeout(handle);
				signal.removeEventListener('abort', abort);
				settle();
			};
			const abort = (): void =>
				finish(() => reject(new ownerWindow.DOMException('任务已取消', 'AbortError')));
			const handle = ownerWindow.setTimeout(
				() => finish(() => (fail ? reject(new Error(`${label}失败`)) : resolve(label))),
				delay
			);
			signal.addEventListener('abort', abort, { once: true });
		});
	}
	function errorProperty(error: unknown, property: 'message' | 'name'): string | undefined {
		if (typeof error !== 'object' || error === null) return undefined;
		const record = error as Record<string, unknown>;
		return property in record ? String(record[property]) : undefined;
	}

	function track(ownerWindow: Window, label: string, delay: number, fail = false): void {
		runs += 1;
		const activeController = new ownerWindow.AbortController();
		controller = activeController;
		controllers.add(activeController);
		const promise = delayedResult(ownerWindow, label, delay, activeController.signal, fail);
		queue.task(promise, {
			error: (error) => {
				const aborted = errorProperty(error, 'name') === 'AbortError';
				return {
					description: errorProperty(error, 'message') ?? String(error),
					priority: aborted ? 'polite' : 'assertive',
					title: aborted ? '任务已取消' : '发布失败',
					tone: aborted ? 'warning' : 'danger'
				};
			},
			id: taskId,
			loading: { description: `${label}由调用方Promise拥有。`, title: '正在发布' },
			success: (result) => ({ description: `${result}已成为最终结果。`, title: '发布成功' })
		});
		// Queue只观察结果；业务仍持有并处理原Promise、AbortController和重试入口。
		void promise.then(
			() => controllers.delete(activeController),
			() => controllers.delete(activeController)
		);
	}

	function demonstrateGeneration(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		const ownerWindow = event.currentTarget.ownerDocument.defaultView!;
		track(ownerWindow, '较慢的旧任务', 1400);
		track(ownerWindow, '较快的新任务', 300);
	}

	onDestroy(() => {
		for (const activeController of controllers) activeController.abort();
		controllers.clear();
		queue.dispose();
	});
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton onclick={demonstrateGeneration}>演示迟到结果防覆盖</ZButton>
		<ZButton
			variant="secondary"
			onclick={(event) =>
				track(event.currentTarget.ownerDocument.defaultView!, '失败任务', 400, true)}
			>运行失败任务</ZButton
		>
		<ZButton variant="ghost" onclick={() => controller?.abort()}>取消最新任务</ZButton>
	</ZStack>
	<ZText tone="muted"
		>运行次数：{runs}；当前：{current?.title ?? '无'} / {current?.tone ?? '无'}</ZText
	>
</ZStack>
<ZToaster {queue} label="异步任务通知" />
