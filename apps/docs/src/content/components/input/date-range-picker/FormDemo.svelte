<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import {
		ZButton,
		ZDateRangePicker,
		ZField,
		ZStack,
		ZText,
		type CalendarRange
	} from '@zadmin/zui';
	const initial: CalendarRange = {
		start: new CalendarDate(2026, 8, 18),
		end: new CalendarDate(2026, 8, 21)
	};
	let value = $state<CalendarRange>(initial);
</script>

<form>
	<ZStack gap="medium">
		<ZField
			description="提交window.start与window.end两个ISO日期"
			label="发布窗口"
			name="window"
			required
		>
			<ZDateRangePicker
				bind:value
				calendarLabel="选择发布窗口"
				defaultValue={initial}
				locale="zh-CN"
			/>
		</ZField>
		<ZButton type="reset" variant="secondary">重置</ZButton>
		<ZText tone="muted">range = {value.start.toString()} / {value.end.toString()}</ZText>
	</ZStack>
</form>
