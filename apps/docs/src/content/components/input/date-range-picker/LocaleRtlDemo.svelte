<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZDateRangePicker, ZField, ZProvider, ZStack, ZText } from '@zadmin/zui';
</script>

<ZProvider direction="rtl" locale="ar-EG" timeZone="Asia/Riyadh">
	<ZStack gap="small">
		<ZField label="نافذة النشر">
			<ZDateRangePicker
				defaultValue={{
					start: new CalendarDate(2026, 9, 16),
					end: new CalendarDate(2026, 9, 22)
				}}
				firstDayOfWeek="sat"
			/>
		</ZField>
		<ZText tone="muted">两个DateField按RTL排列，Calendar水平导航反转，范围值仍保持ISO顺序。</ZText>
	</ZStack>
</ZProvider>
