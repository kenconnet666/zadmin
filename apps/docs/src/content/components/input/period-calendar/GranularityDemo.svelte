<script lang="ts">
	import {
		ZPeriodCalendar,
		ZStack,
		ZText,
		monthPeriod,
		yearPeriod,
		quarterPeriod,
		weekPeriod
	} from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZText>月份</ZText><ZPeriodCalendar
		granularity="month"
		defaultValue={monthPeriod(2026, 9)}
		calendarLabel="报表月份"
	/>
	<ZText>年份</ZText><ZPeriodCalendar
		granularity="year"
		defaultValue={yearPeriod(2026)}
		calendarLabel="归档年份"
	/>
	<ZText>季度</ZText><ZPeriodCalendar
		granularity="quarter"
		defaultValue={quarterPeriod(2026, 3)}
		calendarLabel="计划季度"
	/>
	<ZText>ISO 周</ZText><ZPeriodCalendar
		granularity="week"
		defaultValue={weekPeriod(2026, 37)}
		showWeekNumbers
		calendarLabel="工作周"
	/>
</ZStack>
