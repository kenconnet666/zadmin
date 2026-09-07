<script lang="ts">
	import { CalendarDateTime } from '@internationalized/date';
	import { ZDateTimeRangePicker, ZStack, ZText, type DateTimeRangeValue } from '@zadmin/zui';
	let value = $state<DateTimeRangeValue<'local'> | null>({
		start: new CalendarDateTime(2026, 9, 7, 9),
		end: new CalendarDateTime(2026, 9, 7, 18)
	});
	let commits = $state(0);
</script>

<ZStack gap="medium">
	<ZDateTimeRangePicker
		presentation="inline"
		bind:value
		commitMode="confirm"
		hourCycle={24}
		order="swap"
		onCommit={() => commits++}
		presets={[
			{
				label: '下一天工作时段',
				value: {
					start: new CalendarDateTime(2026, 9, 8, 9),
					end: new CalendarDateTime(2026, 9, 8, 18)
				}
			}
		]}
	/>
	<ZText tone="muted"
		>{value?.start?.toString() ?? '空'} → {value?.end?.toString() ?? '空'} · commit={commits}</ZText
	>
	<ZText tone="muted"
		>起止日期时间由同一个范围值管理；切换端点复用同一面板，预设先进入草稿，确认后才提交。</ZText
	>
</ZStack>
