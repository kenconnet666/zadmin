<script lang="ts">
	import { CalendarDate, getDayOfWeek } from '@internationalized/date';
	import { ZDateRangePicker, ZField, ZStack, ZText } from '@zadmin/zui';

	const reversed = {
		start: new CalendarDate(2026, 9, 28),
		end: new CalendarDate(2026, 9, 20)
	};
</script>

<ZStack gap="small">
	<ZField description="反向完整值显示为9月20日至28日。" label="规范化窗口">
		<ZDateRangePicker
			defaultValue={reversed}
			isDateUnavailable={(date, part) => {
				const weekday = getDayOfWeek(date, 'zh-CN');
				return part === 'start' ? weekday === 0 || weekday === 6 : date.day === 30;
			}}
		/>
	</ZField>
	<ZText tone="muted">完整反向范围自动交换；start/end可分别定义日期可用性。</ZText>
</ZStack>
