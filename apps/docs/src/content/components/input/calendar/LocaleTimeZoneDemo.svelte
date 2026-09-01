<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZCalendar, ZProvider, ZStack, ZText, zhCNLocalePack } from '@zadmin/zui';
</script>

<ZProvider locale="zh-CN" localePack={zhCNLocalePack} timeZone="Asia/Shanghai">
	<ZStack gap="medium">
		<ZText tone="muted">Provider统一locale pack与SSR稳定时区，组件不会猜测浏览器时区。</ZText>
		<ZCalendar
			defaultFocusedValue={new CalendarDate(2026, 8, 18)}
			defaultValue={new CalendarDate(2026, 8, 18)}
		/>
	</ZStack>
</ZProvider>
