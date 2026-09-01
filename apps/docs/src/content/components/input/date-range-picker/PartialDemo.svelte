<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZButton, ZDateRangePicker, ZStack, ZText, type CalendarRangeValue } from '@zadmin/zui';

	let value = $state<CalendarRangeValue | null>({
		start: new CalendarDate(2026, 9, 16),
		end: null
	});
</script>

<ZStack gap="medium">
	<ZDateRangePicker bind:value calendarLabel="补全发布窗口" />
	<ZStack align="center" direction="row" gap="small" wrap>
		<ZButton onclick={() => (value = { start: null, end: new CalendarDate(2026, 9, 30) })}>
			写入end-only草稿
		</ZButton>
		<ZButton onclick={() => (value = null)} variant="secondary">清空范围</ZButton>
	</ZStack>
	<ZText tone="muted">
		start = {value?.start?.toString() ?? 'null'} · end = {value?.end?.toString() ?? 'null'}
	</ZText>
</ZStack>
