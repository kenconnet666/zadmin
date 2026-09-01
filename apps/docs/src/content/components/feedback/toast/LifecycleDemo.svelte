<script lang="ts">
	import { createToastQueue, ZButton, ZStack, ZText, ZToaster } from '@zadmin/zui';
	import { onDestroy } from 'svelte';

	const queue = createToastQueue({ maxVisible: 2 });
	let batch = 0;
	let updates = 0;
	let actions = $state(0);
	const presented = $derived(queue.presentedItems.map((item) => item.title).join('、') || '无');
	onDestroy(() => queue.dispose());

	function addBurst(): void {
		batch += 1;
		for (const index of [1, 2, 3, 4]) {
			queue.push({
				description: `第 ${batch} 批的第 ${index} 条消息。`,
				duration: null,
				id: `batch-${batch}-${index}`,
				title: `排队通知 ${index}`,
				tone: index === 4 ? 'warning' : 'info'
			});
		}
	}

	function updateStableToast(): void {
		updates += 1;
		queue.push({
			description: `稳定 id 原位更新了 ${updates} 次，不会重复占用队列。`,
			duration: null,
			id: 'deployment-progress',
			title: updates === 1 ? '正在部署' : '部署进度已更新',
			tone: updates > 1 ? 'success' : 'info'
		});
	}

	function addActionToast(): void {
		queue.push({
			actionLabel: '查看记录',
			description: '操作、关闭与超时都会执行同一退出清理流程。',
			duration: 5000,
			onAction: () => (actions += 1),
			title: '构建已完成',
			tone: 'success'
		});
	}
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton onclick={addBurst}>加入 4 条通知</ZButton>
		<ZButton variant="secondary" onclick={updateStableToast}>更新稳定 id</ZButton>
		<ZButton variant="secondary" onclick={addActionToast}>发送定时操作通知</ZButton>
		<ZButton variant="ghost" onclick={() => queue.clear()}>清空</ZButton>
	</ZStack>
	<ZText tone="muted">
		viewport：{presented}；排队：{queue.queuedCount}；已执行操作：{actions}
	</ZText>
</ZStack>
<ZToaster {queue} maxVisible={2} label="生命周期通知" />
