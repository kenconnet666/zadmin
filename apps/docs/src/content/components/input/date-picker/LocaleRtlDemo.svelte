<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZDatePicker, ZField, ZProvider, ZStack, ZText } from '@zadmin/zui';
</script>

<ZProvider direction="rtl" locale="ar-EG" timeZone="Asia/Riyadh">
	<ZStack gap="small">
		<ZField label="تاريخ النشر">
			<ZDatePicker defaultValue={new CalendarDate(2026, 9, 16)} firstDayOfWeek="sat" />
		</ZField>
		<ZText tone="muted">RTL反转水平Calendar键，日期segment顺序和数字由ar-EG locale决定。</ZText>
	</ZStack>
</ZProvider>
