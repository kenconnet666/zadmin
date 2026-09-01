<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZButton, ZDatePicker, ZField, ZStack, ZText } from '@zadmin/zui';
	let value = $state(new CalendarDate(2026, 8, 18));
</script>

<form>
	<ZStack gap="medium">
		<ZField
			description="由Provider统一中文文案与Asia/Shanghai时区"
			label="上线日期"
			name="date"
			required
		>
			<ZDatePicker
				bind:value
				calendarLabel="选择上线日期"
				defaultValue={new CalendarDate(2026, 8, 18)}
				locale="zh-CN"
			/>
		</ZField>
		<ZButton type="reset" variant="secondary">重置</ZButton>
		<ZText tone="muted">value = {value.toString()}</ZText>
	</ZStack>
</form>
