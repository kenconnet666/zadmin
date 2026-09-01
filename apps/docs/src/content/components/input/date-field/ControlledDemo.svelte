<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZButton, ZDateField, ZField, ZStack, ZText } from '@zadmin/zui';

	let value = $state<CalendarDate | null>(null);
</script>

<ZStack gap="medium">
	<ZField label="受控日期">
		<ZDateField bind:value locale="zh-CN" />
	</ZField>
	<ZStack align="center" direction="row" gap="small" wrap>
		<ZButton onclick={() => (value = new CalendarDate(2026, 10, 1))}>写入国庆日期</ZButton>
		<ZButton onclick={() => (value = null)} variant="secondary">显式写入 null</ZButton>
		<ZText tone="muted">owner = {value?.toString() ?? 'null'}</ZText>
	</ZStack>
</ZStack>
