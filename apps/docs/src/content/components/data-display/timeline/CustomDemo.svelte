<script lang="ts">
	import { ZStack, ZTag, ZText, ZTimeline } from '@zadmin/zui';

	const items = [
		{ id: 'review', title: '代码审查', status: 'done' as const, time: '10:20' },
		{ id: 'canary', title: '金丝雀发布', status: 'current' as const, time: '10:34' }
	];
</script>

<ZTimeline label="自定义发布时间线" {items}>
	{#snippet item(entry)}
		<ZStack direction="row" gap="medium" align="center">
			<ZText weight="semibold">{entry.title}</ZText>
			<ZTag tone={entry.status === 'done' ? 'success' : 'accent'}>{entry.time}</ZTag>
		</ZStack>
	{/snippet}
</ZTimeline>
