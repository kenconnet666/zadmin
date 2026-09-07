<script lang="ts">
	import {
		ZPeriodCalendar,
		ZStack,
		ZText,
		monthPeriod,
		yearPeriod,
		serializePeriod,
		type MonthPeriod,
		type PeriodRangeValue
	} from '@zadmin/zui';
	let months = $state<readonly MonthPeriod[]>([monthPeriod(2026, 9), monthPeriod(2026, 7)]);
	let years = $state<PeriodRangeValue<'year'> | null>(null);
</script>

<ZStack gap="large">
	<ZPeriodCalendar
		granularity="month"
		selectionMode="multiple"
		bind:value={months}
		calendarLabel="多个报表月份"
	/>
	<ZText tone="muted">按输入顺序：{months.map(serializePeriod).join(' · ') || '空'}</ZText>
	<ZPeriodCalendar
		granularity="year"
		selectionMode="range"
		bind:value={years}
		defaultFocusedValue={yearPeriod(2026)}
		calendarLabel="归档年份范围"
	/>
	<ZText tone="muted"
		>{years?.start ? serializePeriod(years.start) : '空'} → {years?.end
			? serializePeriod(years.end)
			: '空'}</ZText
	>
	<ZText tone="muted"
		>多选去重并保留选择顺序；范围先选择起点，再选择终点。焦点移动和悬停预览不会提前提交终点。</ZText
	>
</ZStack>
