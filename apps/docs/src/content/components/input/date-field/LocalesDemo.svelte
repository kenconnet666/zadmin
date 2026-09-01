<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import {
		ZDateField,
		ZField,
		ZProvider,
		ZStack,
		enUSLocalePack,
		zhCNLocalePack
	} from '@zadmin/zui';
	const date = new CalendarDate(2026, 12, 31);
</script>

<ZStack gap="large">
	<ZProvider locale="en-US" localePack={enUSLocalePack} timeZone="UTC">
		<ZField label="English date"><ZDateField defaultValue={date} /></ZField>
	</ZProvider>
	<ZProvider locale="zh-CN" localePack={zhCNLocalePack} timeZone="Asia/Shanghai">
		<ZField label="只读日期" readonly><ZDateField defaultValue={date} readonly /></ZField>
	</ZProvider>
	<ZField label="禁用日期" disabled><ZDateField defaultValue={date} disabled /></ZField>
</ZStack>
