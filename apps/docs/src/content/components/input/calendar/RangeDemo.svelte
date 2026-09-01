<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZCalendar, ZStack, ZText, type CalendarRangeValue } from '@zadmin/zui';

	const partial: CalendarRangeValue = {
		start: new CalendarDate(2026, 9, 8),
		end: null
	};
	const complete: CalendarRangeValue = {
		start: new CalendarDate(2026, 9, 8),
		end: new CalendarDate(2026, 9, 18)
	};
</script>

<ZStack direction="row" gap="large" wrap>
	<ZStack gap="small">
		<ZText tone="muted">等待结束日期：只标记起点</ZText>
		<ZCalendar defaultFocusedValue={partial.start ?? undefined} range={partial} readonly />
	</ZStack>
	<ZStack gap="small">
		<ZText tone="muted">完整范围：起止端点和区间共享语义</ZText>
		<ZCalendar defaultFocusedValue={complete.start ?? undefined} range={complete} readonly />
	</ZStack>
</ZStack>
