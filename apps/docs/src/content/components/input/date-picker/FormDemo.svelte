<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZButton, ZDatePicker, ZStack, ZText } from '@zadmin/zui';
	let value = $state(new CalendarDate(2026, 8, 18));
</script>

<form>
	<ZStack gap="medium"
		><ZDatePicker
			bind:value
			calendarLabel="选择上线日期"
			defaultValue={new CalendarDate(2026, 8, 18)}
			locale="zh-CN"
			name="date"
			triggerLabel={(display) => `上线日期 ${display}`}
		/><ZButton type="reset" variant="secondary">重置</ZButton><ZText tone="muted"
			>value = {value.toString()}</ZText
		></ZStack
	>
</form>
