<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Rocket from '@lucide/svelte/icons/rocket';
	import { ZStack, ZTag, ZText, ZTimeline } from '@zadmin/zui';

	const items = [
		{ key: 'review', title: '代码审查', status: 'done' as const, time: '10:20' },
		{ key: 'canary', title: '金丝雀发布', status: 'current' as const, time: '10:34' }
	];
</script>

<ZTimeline label="自定义发布时间线" {items}>
	{#snippet icon(entry)}
		{#if entry.status === 'done'}
			<CircleCheck aria-hidden="true" size={20} />
		{:else}
			<Rocket aria-hidden="true" size={20} />
		{/if}
	{/snippet}
	{#snippet content(entry)}
		<ZStack direction="row" gap="medium" align="center">
			<ZText weight="semibold">{entry.title}</ZText>
			<ZTag tone={entry.status === 'done' ? 'success' : 'accent'}>{entry.status}</ZTag>
		</ZStack>
	{/snippet}
	{#snippet time(entry)}<ZText as="small" tone="muted">{entry.time}</ZText>{/snippet}
</ZTimeline>
