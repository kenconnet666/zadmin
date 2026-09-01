<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZButton, ZDatePicker, ZStack, ZText } from '@zadmin/zui';

	let open = $state(false);
	let value = $state<CalendarDate | null>(null);
</script>

<ZStack gap="medium">
	<ZDatePicker bind:open bind:value calendarLabel="受控选择日期" />
	<ZStack align="center" direction="row" gap="small" wrap>
		<ZButton onclick={() => (open = true)}>外部打开</ZButton>
		<ZButton onclick={() => (value = new CalendarDate(2026, 10, 1))} variant="secondary">
			写入日期
		</ZButton>
		<ZButton onclick={() => (value = null)} variant="ghost">外部清空</ZButton>
	</ZStack>
	<ZText tone="muted">open = {String(open)} · value = {value?.toString() ?? 'null'}</ZText>
</ZStack>
