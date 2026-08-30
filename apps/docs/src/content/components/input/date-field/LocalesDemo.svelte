<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZDateField, ZField, ZStack } from '@zadmin/zui';
	const date = new CalendarDate(2026, 12, 31);
</script>

<ZStack gap="large">
	<ZField label="English date"><ZDateField defaultValue={date} locale="en-US" /></ZField>
	<ZField label="只读日期" readonly
		><ZDateField defaultValue={date} locale="zh-CN" readonly /></ZField
	>
	<ZField label="禁用日期" disabled><ZDateField defaultValue={date} disabled /></ZField>
</ZStack>
