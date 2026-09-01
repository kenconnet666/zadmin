<script lang="ts">
	import { CalendarDate, getDayOfWeek } from '@internationalized/date';
	import { ZDatePicker, ZField, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="small">
	<ZField description="选择后保持打开，便于连续比较；周末不可选。" label="维护日">
		<ZDatePicker
			clearable={false}
			closeOnSelect={false}
			defaultValue={new CalendarDate(2026, 9, 16)}
			isDateUnavailable={(date) => {
				const weekday = getDayOfWeek(date, 'zh-CN');
				return weekday === 0 || weekday === 6;
			}}
			showOutsideDates={false}
		/>
	</ZField>
	<ZText tone="muted">closeOnSelect与clearable只改变交互策略，不建立第二份value状态。</ZText>
</ZStack>
