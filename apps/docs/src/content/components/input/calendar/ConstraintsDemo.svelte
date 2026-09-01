<script lang="ts">
	import { CalendarDate, getDayOfWeek } from '@internationalized/date';
	import { ZCalendar, ZText, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZCalendar
		calendarLabel="受发布日期窗口限制的日历"
		defaultFocusedValue={new CalendarDate(2026, 8, 18)}
		isDateUnavailable={(date) => {
			const day = getDayOfWeek(date, 'zh-CN');
			return day === 6 || day === 0;
		}}
		locale="zh-CN"
		maxValue={new CalendarDate(2026, 8, 28)}
		minValue={new CalendarDate(2026, 8, 10)}
		showOutsideDates={false}
	/>
	<ZText tone="muted">仅8月10–28日可选，周末禁用，相邻月份日期隐藏。</ZText>
</ZStack>
