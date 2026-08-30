<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZButton, ZDateField, ZField, ZStack, ZText } from '@zadmin/zui';

	const minValue = new CalendarDate(2026, 8, 10);
	const maxValue = new CalendarDate(2026, 8, 20);
	const defaultValue = new CalendarDate(2026, 8, 15);
	let value = $state(defaultValue);
</script>

<form>
	<ZStack gap="medium">
		<ZField label="维护窗口日期" description="上下键cycle不会越过8月10日至20日。">
			<ZDateField
				bind:value
				data-testid="date-field-bounds"
				{defaultValue}
				locale="zh-CN"
				{maxValue}
				{minValue}
			/>
		</ZField>
		<ZStack direction="row" gap="small" align="center" wrap>
			<ZButton type="reset" variant="secondary">恢复中间日期</ZButton>
			<ZText tone="muted">value = {value.toString()} · 允许 2026-08-10…2026-08-20</ZText>
		</ZStack>
	</ZStack>
</form>
