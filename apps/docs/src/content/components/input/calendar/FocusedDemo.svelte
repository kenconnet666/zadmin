<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZButton, ZCalendar, ZStack, ZText } from '@zadmin/zui';

	let focusedValue = $state(new CalendarDate(2026, 9, 14));
	let value = $state<CalendarDate | null>(null);
</script>

<ZStack gap="medium">
	<ZCalendar bind:focusedValue bind:value calendarLabel="受控焦点日历" />
	<ZStack align="center" direction="row" gap="small" wrap>
		<ZButton
			onclick={() => (focusedValue = focusedValue.subtract({ months: 1 }))}
			variant="secondary"
		>
			焦点上一月
		</ZButton>
		<ZButton onclick={() => (focusedValue = focusedValue.add({ months: 1 }))} variant="secondary">
			焦点下一月
		</ZButton>
		<ZButton onclick={() => (value = null)} variant="ghost">清空选择</ZButton>
	</ZStack>
	<ZText tone="muted">
		focusedValue = {focusedValue.toString()} · value = {value?.toString() ?? 'null'}
	</ZText>
</ZStack>
