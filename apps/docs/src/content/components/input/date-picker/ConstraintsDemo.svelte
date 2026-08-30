<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZDatePicker, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZDatePicker
		calendarLabel="选择维护日期"
		defaultValue={new CalendarDate(2026, 8, 18)}
		maxValue={new CalendarDate(2026, 8, 31)}
		minValue={new CalendarDate(2026, 8, 1)}
		placeholder="选择8月日期"
	/>
	<ZDatePicker disabled defaultValue={new CalendarDate(2026, 8, 18)} />
</ZStack>
