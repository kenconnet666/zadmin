<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { ZCalendar, ZButton, ZStack, ZText } from '@zadmin/zui';
	let value = $state<readonly CalendarDate[]>([
		new CalendarDate(2026, 9, 7),
		new CalendarDate(2026, 10, 5)
	]);
	let focusedValue = $state(new CalendarDate(2026, 9, 7));
</script>

<ZStack gap="medium">
	<ZCalendar
		selectionMode="multiple"
		bind:value
		bind:focusedValue
		visibleMonths={2}
		showWeekNumbers
		weekNumbering="iso"
		calendarLabel="两个月的工作日期"
	/>
	<ZButton
		variant="outline"
		onclick={() => {
			focusedValue = new CalendarDate(2026, 10, 15);
		}}>聚焦第二个月</ZButton
	>
	<ZText tone="muted"
		>按选择顺序：{value.map((date) => date.toString()).join(' · ') || '空'} · focused={focusedValue.toString()}</ZText
	>
	<ZText tone="muted"
		>两个网格共用一个焦点与选择owner。聚焦已经可见的第二个月不会把它移到首月，跨月日期也不会重复生成可交互副本。</ZText
	>
</ZStack>
