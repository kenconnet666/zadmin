<script lang="ts">
	import { createToastQueue, ZButton, ZStack, ZToaster } from '@zadmin/zui';
	import { onDestroy } from 'svelte';

	const queue = createToastQueue();
	let count = 0;
	onDestroy(() => queue.dispose());
	function addToast(): void {
		count += 1;
		queue.push({
			actionLabel: '查看',
			description: `构建 #${count} 已通过全部门禁。`,
			duration: null,
			title: '发布制品已就绪',
			tone: 'success'
		});
	}
</script>

<ZStack direction="row" gap="medium">
	<ZButton onclick={addToast}>发送通知</ZButton>
	<ZButton variant="secondary" onclick={() => queue.clear()}>清空通知</ZButton>
</ZStack>
<ZToaster {queue} placement="bottom-end" label="发布通知" />
