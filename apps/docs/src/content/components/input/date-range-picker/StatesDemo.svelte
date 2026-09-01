<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZDateRangePicker, ZStack } from '@zadmin/zui';
	const range = { start: new CalendarDate(2026, 9, 1), end: new CalendarDate(2026, 9, 7) };
</script>

<ZStack gap="medium">
	<ZDateRangePicker calendarLabel="选择统计周期" />
	<ZDateRangePicker readonly defaultValue={range} />
	<ZDateRangePicker disabled defaultValue={range} />
</ZStack>
