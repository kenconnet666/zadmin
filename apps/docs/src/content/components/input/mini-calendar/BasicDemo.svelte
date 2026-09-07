<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZMiniCalendar, ZStack, ZText } from '@zadmin/zui';

	let value = $state<CalendarDate | null>(new CalendarDate(2026, 9, 15));
</script>

<ZStack gap="small">
	<ZMiniCalendar
		bind:value
		calendarLabel="选择发布日期"
		defaultFocusedValue={new CalendarDate(2026, 9, 15)}
		locale="zh-CN"
		timeZone="Asia/Shanghai"
	/>
	<ZText tone="muted">已选：{value?.toString() ?? '未选择'}</ZText>
</ZStack>
