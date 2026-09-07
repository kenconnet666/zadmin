<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZCalendar, ZButton, ZStack, ZText, type CalendarRangeValue } from '@zadmin/zui';
	let value = $state<CalendarRangeValue | null>({ start: new CalendarDate(2026, 9, 7), end: null });
	let allowNonContiguousRange = $state(false);
</script>

<ZStack gap="medium">
	<ZCalendar
		selectionMode="range"
		bind:value
		visibleMonths={2}
		{allowNonContiguousRange}
		isDateUnavailable={(date) => date.year === 2026 && date.month === 9 && date.day === 13}
		calendarLabel="维护日期范围"
	/>
	<ZButton
		variant="outline"
		onclick={() => {
			allowNonContiguousRange = !allowNonContiguousRange;
		}}>允许跨过禁用日：{allowNonContiguousRange ? '是' : '否'}</ZButton
	>
	<ZText tone="muted">{value?.start?.toString() ?? '空'} → {value?.end?.toString() ?? '空'}</ZText>
	<ZText tone="muted"
		>9 月 13
		日不可用。默认完整范围不能跨过它；允许非连续范围时仅要求端点可用。高亮预览不产生额外值变更。</ZText
	>
</ZStack>
