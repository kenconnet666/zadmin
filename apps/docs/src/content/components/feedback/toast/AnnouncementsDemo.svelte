<script lang="ts">
	import { createToastQueue, ZButton, ZStack, ZText, ZToaster } from '@zadmin/zui';
	import { onDestroy } from 'svelte';

	const queue = createToastQueue({ maxVisible: 4 });
	let burst = 0;
	onDestroy(() => queue.dispose());

	function announceFailures(): void {
		burst += 1;
		for (const index of [1, 2, 3]) {
			queue.push({
				description: `第 ${burst} 批后台检查。`,
				duration: null,
				id: `failure-${burst}-${index}`,
				title: `关键检查 ${index} 失败`,
				tone: 'danger'
			});
		}
	}
	function announceSuccess(): void {
		queue.push({ duration: 5000, title: '普通保存成功', tone: 'success' });
	}
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton onclick={announceFailures}>连续发送 3 条关键失败</ZButton>
		<ZButton onclick={announceSuccess} variant="secondary">发送普通成功</ZButton>
		<ZButton
			onclick={() => queue.update(`failure-${burst}-1`, { title: '关键检查详情已更新' })}
			variant="ghost">同 ID 更新</ZButton
		>
	</ZStack>
	<ZText tone="muted">
		视觉Toast立即原位更新；集中live
		region不会重复公告同一实例，连续assertive按序节流，普通success保持polite。
	</ZText>
</ZStack>
<ZToaster {queue} maxVisible={4} label="公告优先级演示" />
