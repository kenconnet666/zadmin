<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZButton, ZCalendar, ZStack, ZText } from '@zadmin/zui';
	let value = $state<CalendarDate | null>(new CalendarDate(2026, 8, 18));
</script>

<form>
	<ZStack gap="medium"
		><ZCalendar
			bind:value
			defaultValue={new CalendarDate(2026, 8, 18)}
			defaultFocusedValue={new CalendarDate(2026, 8, 18)}
			firstDayOfWeek="mon"
			locale="zh-CN"
			name="date"
			calendarLabel="部署日期"
		/><ZButton type="reset" variant="secondary">重置</ZButton><ZText tone="muted"
			>value = {value?.toString() ?? 'null'}</ZText
		></ZStack
	>
</form>
