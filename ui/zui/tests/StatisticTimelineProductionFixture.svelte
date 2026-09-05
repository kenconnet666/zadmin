<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import { ZStatistic, ZText, ZTimeline, type TimelineItem } from '../src/entrypoints/index.js';

	const typedItems = [
		{
			datetime: '2026-09-02T09:10:00+08:00',
			key: 1,
			status: 'done' as const,
			time: '09:10',
			title: 'Numeric key'
		},
		{
			datetime: '2026-09-02T09:20:00+08:00',
			key: '1',
			status: 'current' as const,
			time: '09:20',
			title: 'String key'
		}
	] satisfies readonly TimelineItem[];
	const longItems = [
		{
			key: 'long',
			status: 'done' as const,
			title: 'Long production event',
			description:
				'跨区域数据同步完成后继续核对租户数据、延迟、错误率和队列积压，正文在窄容器内保持真实列表语义。'
		}
	] satisfies readonly TimelineItem[];
</script>

<ZStatistic
	data-testid="statistic-intl"
	label="Revenue"
	locale="de-DE"
	precision={2}
	trend={12.5}
	value={1234.5}
/>
<ZStatistic
	data-testid="statistic-formatter"
	label="Identifier"
	locale="en-US"
	value={12345n}
	formatter={(value, { locale }) => `#${new Intl.NumberFormat(locale).format(value)}`}
/>
<ZStatistic data-testid="statistic-loading" label="Loading" loading value={0} />

<ZTimeline aria-label="Typed production timeline" data-testid="timeline-typed" items={typedItems}>
	{#snippet icon()}<CircleCheck aria-hidden="true" size={20} />{/snippet}
	{#snippet content(entry, index)}
		<ZText weight="semibold">{index}:{entry.title}</ZText>
	{/snippet}
	{#snippet time(entry)}<ZText as="small">at {entry.time}</ZText>{/snippet}
</ZTimeline>

<ZTimeline
	data-testid="timeline-pending"
	items={typedItems}
	label="Pending reversed timeline"
	reverse
>
	{#snippet pending()}<ZText>Still processing</ZText>{/snippet}
</ZTimeline>

<div data-testid="timeline-rtl-owner" dir="rtl" style="inline-size: 24rem;">
	<ZTimeline
		data-testid="timeline-alternate"
		items={longItems}
		label="RTL timeline"
		mode="alternate"
	/>
</div>

<ZTimeline
	data-testid="timeline-keyed"
	items={[{ key: 'keyed', status: 'done', title: 'Keyed identity' }]}
	label="Keyed timeline"
/>
