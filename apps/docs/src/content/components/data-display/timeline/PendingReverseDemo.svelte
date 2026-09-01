<script lang="ts">
	import { ZButton, ZStack, ZText, ZTimeline } from '@zadmin/zui';

	let reverse = $state(false);
	const items = [
		{ key: 'queued', status: 'done' as const, title: '进入队列', time: '14:20' },
		{ key: 'started', status: 'current' as const, title: '开始计算', time: '14:21' }
	];
</script>

<ZStack gap="medium" align="start">
	<ZButton variant="secondary" onclick={() => (reverse = !reverse)}>
		{reverse ? '恢复正序' : '查看倒序'}
	</ZButton>
	<ZTimeline label="带未完成尾项的计算时间线" {items} {reverse}>
		{#snippet pending()}
			<ZText weight="semibold">等待计算结果</ZText>
			<ZText as="p" tone="muted">pending属于时间流尾端；倒序时移到列表开头。</ZText>
		{/snippet}
	</ZTimeline>
</ZStack>
