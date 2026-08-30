<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZButton, ZDateRangePicker, ZStack, ZText, type CalendarRange } from '@zadmin/zui';
	const initial: CalendarRange = {
		start: new CalendarDate(2026, 8, 18),
		end: new CalendarDate(2026, 8, 21)
	};
	let value = $state<CalendarRange>(initial);
</script>

<form>
	<ZStack gap="medium"
		><ZDateRangePicker
			bind:value
			calendarLabel="选择发布窗口"
			defaultValue={initial}
			locale="zh-CN"
			name="window"
		/><ZButton type="reset" variant="secondary">重置</ZButton><ZText tone="muted"
			>range = {value.start.toString()} / {value.end.toString()}</ZText
		></ZStack
	>
</form>
