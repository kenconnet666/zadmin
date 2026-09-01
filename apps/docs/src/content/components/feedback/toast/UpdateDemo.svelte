<script lang="ts">
	import { createToastQueue, ZButton, ZStack, ZText, ZToaster } from '@zadmin/zui';
	import { onDestroy } from 'svelte';

	const queue = createToastQueue();
	const toastId = 'release-progress';
	let progress = $state(0);
	const current = $derived(queue.items.find((item) => item.id === toastId));
	onDestroy(() => queue.dispose());

	function open(): void {
		progress = 10;
		queue.push({
			description: '说明、操作和持久时长会在局部更新时保留。',
			duration: null,
			id: toastId,
			title: `发布进度 ${progress}%`
		});
	}
	function update(): void {
		progress = Math.min(100, progress + 30);
		queue.update(toastId, {
			title: progress === 100 ? '发布完成' : `发布进度 ${progress}%`,
			tone: progress === 100 ? 'success' : 'info'
		});
	}
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton onclick={open}>创建稳定 ID</ZButton>
		<ZButton onclick={update} variant="secondary">局部更新</ZButton>
		<ZButton onclick={() => queue.dismiss(toastId)} variant="ghost">关闭</ZButton>
	</ZStack>
	<ZText tone="muted">
		当前：{current?.title ?? '无'}；description：{current?.description ??
			'无'}；duration：{current?.duration ?? '持久'}
	</ZText>
</ZStack>
<ZToaster {queue} label="更新通知" />
