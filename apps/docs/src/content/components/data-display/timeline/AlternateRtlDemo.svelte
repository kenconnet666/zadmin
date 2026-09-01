<script lang="ts">
	import { ZCard, ZStack, ZText, ZTimeline } from '@zadmin/zui';

	const items = [
		{ key: 'draft', status: 'done' as const, title: '草稿完成', time: '08:30' },
		{ key: 'review', status: 'done' as const, title: '审阅通过', time: '09:00' },
		{ key: 'publish', status: 'current' as const, title: '发布中', time: '09:15' }
	];
</script>

<ZStack gap="large">
	<ZCard variant="outlined">
		{#snippet header()}<ZText weight="semibold">LTR alternate</ZText>{/snippet}
		<ZTimeline label="LTR交错时间线" mode="alternate" {items} />
	</ZCard>
	<ZCard variant="outlined" dir="rtl">
		{#snippet header()}<ZText weight="semibold">RTL alternate</ZText>{/snippet}
		<ZTimeline label="RTL交错时间线" mode="alternate" {items} />
	</ZCard>
</ZStack>
