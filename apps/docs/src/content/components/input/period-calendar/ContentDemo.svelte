<script lang="ts">
	import {
		ZButton,
		ZPeriodCalendar,
		ZPeriodPicker,
		ZStack,
		ZText,
		monthPeriod,
		type PeriodCalendarCellContext,
		type PeriodCalendarHeaderContext
	} from '@zadmin/zui';
</script>

{#snippet periodCell(context: PeriodCalendarCellContext<'month'>)}
	<span>
		<strong>{context.visibleLabel}</strong>
		{#if context.selected}<small> 已选</small>{/if}
	</span>
{/snippet}

{#snippet header(context: PeriodCalendarHeaderContext<'month'>)}
	<ZButton
		aria-label="上一周期页"
		disabled={context.previousDisabled}
		onclick={context.goToPreviousPage}
		size={context.size}
		variant="ghost">{context.direction === 'rtl' ? '›' : '‹'}</ZButton
	>
	<ZText weight="semibold">{context.label}</ZText>
	<ZButton
		aria-label="下一周期页"
		disabled={context.nextDisabled}
		onclick={context.goToNextPage}
		size={context.size}
		variant="ghost">{context.direction === 'rtl' ? '‹' : '›'}</ZButton
	>
{/snippet}

<ZStack gap="small">
	<ZPeriodCalendar
		calendarLabel="自定义月份日历"
		defaultValue={monthPeriod(2026, 9)}
		granularity="month"
		{header}
		{periodCell}
	/>
	<ZPeriodPicker
		calendarLabel="自定义月份选择器"
		defaultValue={monthPeriod(2026, 9)}
		granularity="month"
		{header}
		{periodCell}
	/>
	<ZText tone="muted"
		>同一periodCell和header也可由PeriodPicker透传；它们只定制内容，Period记录和roving
		grid仍由组件拥有。</ZText
	>
</ZStack>
