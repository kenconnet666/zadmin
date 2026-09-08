<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import {
		ZButton,
		ZMiniCalendar,
		ZStack,
		ZText,
		type CalendarCellContext,
		type CalendarHeaderContext
	} from '@zadmin/zui';

	let value = $state<CalendarDate | null>(new CalendarDate(2026, 9, 15));

	function weekday(context: CalendarCellContext): string {
		return new Intl.DateTimeFormat('zh-CN', { weekday: 'short', timeZone: 'Asia/Shanghai' }).format(
			context.date.toDate('Asia/Shanghai')
		);
	}
</script>

{#snippet dateCell(context: CalendarCellContext)}
	<span>{weekday(context)} <strong>{context.date.day}</strong></span>
{/snippet}

{#snippet header(context: CalendarHeaderContext)}
	{@const PreviousIcon = context.direction === 'rtl' ? ChevronRight : ChevronLeft}
	{@const NextIcon = context.direction === 'rtl' ? ChevronLeft : ChevronRight}
	<ZButton
		aria-label="上一组日期"
		disabled={context.previousDisabled}
		onclick={context.goToPreviousPage}
		shape="square"
		size={context.size}
		variant="ghost"><PreviousIcon aria-hidden="true" size="1em" /></ZButton
	>
	<ZText weight="semibold">{context.label}</ZText>
	<ZButton
		aria-label="下一组日期"
		disabled={context.nextDisabled}
		onclick={context.goToNextPage}
		shape="square"
		size={context.size}
		variant="ghost"><NextIcon aria-hidden="true" size="1em" /></ZButton
	>
{/snippet}

<ZStack gap="small">
	<ZMiniCalendar
		bind:value
		calendarLabel="排班日期"
		{dateCell}
		defaultFocusedValue={new CalendarDate(2026, 9, 15)}
		dir="rtl"
		{header}
		isDateUnavailable={(date) => date.day === 18 || date.day === 19}
		locale="zh-CN"
		size="small"
		timeZone="Asia/Shanghai"
		visibleDays={10}
	/>
	<ZText tone="muted">十天窗口在每行七天后自动换行；不可排班日期仍由Calendar统一约束。</ZText>
</ZStack>
