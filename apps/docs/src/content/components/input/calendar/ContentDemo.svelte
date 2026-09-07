<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import {
		ZButton,
		ZCalendar,
		ZDatePicker,
		ZDateRangePicker,
		ZStack,
		ZText,
		type CalendarCellContext,
		type CalendarHeaderContext
	} from '@zadmin/zui';
</script>

{#snippet dateCell(context: CalendarCellContext)}
	<span>
		{context.date.day}
		{#if context.today}<sup>今</sup>{/if}
		{#if context.highlighted}<small aria-hidden="true"> •</small>{/if}
	</span>
{/snippet}

{#snippet header(context: CalendarHeaderContext)}
	<ZButton
		aria-label="上一页"
		disabled={context.previousDisabled}
		onclick={context.goToPreviousPage}
		size={context.size}
		variant="ghost">{context.direction === 'rtl' ? '›' : '‹'}</ZButton
	>
	<ZText weight="semibold">{context.label}</ZText>
	<ZButton
		aria-label="下一页"
		disabled={context.nextDisabled}
		onclick={context.goToNextPage}
		size={context.size}
		variant="ghost">{context.direction === 'rtl' ? '‹' : '›'}</ZButton
	>
{/snippet}

<ZStack gap="small">
	<ZCalendar
		calendarLabel="自定义发布日历"
		defaultFocusedValue={new CalendarDate(2026, 9, 15)}
		{dateCell}
		{header}
		highlightRange={{
			start: new CalendarDate(2026, 9, 10),
			end: new CalendarDate(2026, 9, 12)
		}}
		locale="zh-CN"
	/>
	<ZDatePicker
		calendarHeader={header}
		calendarLabel="自定义发布日期"
		defaultValue={new CalendarDate(2026, 9, 15)}
		{dateCell}
		locale="zh-CN"
	/>
	<ZDateRangePicker
		calendarHeader={header}
		calendarLabel="自定义发布范围"
		defaultValue={{
			start: new CalendarDate(2026, 9, 10),
			end: new CalendarDate(2026, 9, 15)
		}}
		{dateCell}
		locale="zh-CN"
	/>
	<ZText tone="muted"
		>同一dateCell和header可由Calendar直接使用，也可经DatePicker/DateRangePicker透传；日期按钮、ARIA、焦点、选择和表单所有权仍由组件内部保留。</ZText
	>
</ZStack>
