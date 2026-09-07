<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import ZCalendar, {
		type CalendarCellContext,
		type CalendarHeaderContext
	} from '../src/components/input/ZCalendar.svelte';
	import ZDatePicker from '../src/components/input/ZDatePicker.svelte';
	import ZDateRangePicker from '../src/components/input/ZDateRangePicker.svelte';
	import ZPeriodCalendar, {
		type PeriodCalendarCellContext,
		type PeriodCalendarHeaderContext
	} from '../src/components/input/ZPeriodCalendar.svelte';
	import ZPeriodPicker from '../src/components/input/ZPeriodPicker.svelte';
	import { monthPeriod, serializePeriod, type MonthPeriod } from '../src/runtime/period.js';

	let date = $state<CalendarDate | null>(new CalendarDate(2026, 9, 15));
	let period = $state<MonthPeriod | null>(monthPeriod(2026, 5));
	let dateChanges = $state(0);
	let periodChanges = $state(0);
</script>

{#snippet dateCell(context: CalendarCellContext)}
	<span
		data-custom-date={context.date.toString()}
		data-context-frozen={Object.isFrozen(context) || undefined}
		data-direction={context.direction}
		data-focused={context.focused || undefined}
		data-highlighted={context.highlighted || undefined}
		data-outside={context.outside || undefined}
		data-preview={context.preview || undefined}
		data-preview-invalid={context.previewInvalid || undefined}
		data-range-edge={context.rangeEdge}
		data-selected={context.selected || undefined}
		data-size={context.size}
		data-today={context.today || undefined}
		data-unavailable={context.unavailable || undefined}
	>
		{context.date.day}{#if context.highlighted}<small aria-hidden="true">•</small>{/if}
	</span>
{/snippet}

{#snippet dateHeader(context: CalendarHeaderContext)}
	<button
		type="button"
		data-custom-calendar-previous
		disabled={context.previousDisabled}
		onclick={context.goToPreviousPage}>Previous</button
	>
	<strong
		data-custom-calendar-label
		data-context-frozen={Object.isFrozen(context) || undefined}
		data-direction={context.direction}
		data-size={context.size}>{context.label}|{context.visibleMonths.length}</strong
	>
	<button
		type="button"
		data-custom-calendar-next
		disabled={context.nextDisabled}
		onclick={context.goToNextPage}>Next</button
	>
{/snippet}

{#snippet periodCell(context: PeriodCalendarCellContext<'month'>)}
	<span
		data-custom-period={serializePeriod(context.period)}
		data-context-frozen={Object.isFrozen(context) || undefined}
		data-current={context.current || undefined}
		data-direction={context.direction}
		data-focused={context.focused || undefined}
		data-preview={context.preview || undefined}
		data-preview-invalid={context.previewInvalid || undefined}
		data-selected={context.selected || undefined}
		data-size={context.size}
		data-unavailable={context.unavailable || undefined}
	>
		{context.visibleLabel}
	</span>
{/snippet}

{#snippet periodHeader(context: PeriodCalendarHeaderContext<'month'>)}
	<button
		type="button"
		data-custom-period-previous
		disabled={context.previousDisabled}
		onclick={context.goToPreviousPage}>Previous periods</button
	>
	<strong
		data-custom-period-label
		data-context-frozen={Object.isFrozen(context) || undefined}
		data-direction={context.direction}
		data-size={context.size}>{context.label}|{context.visiblePeriods.length}</strong
	>
	<button
		type="button"
		data-custom-period-next
		disabled={context.nextDisabled}
		onclick={context.goToNextPage}>Next periods</button
	>
{/snippet}

<form data-testid="calendar-content-form">
	<ZCalendar
		bind:value={date}
		calendarLabel="Custom date calendar"
		data-testid="calendar-content"
		defaultFocusedValue={new CalendarDate(2026, 9, 15)}
		dir="rtl"
		{dateCell}
		header={dateHeader}
		highlightRange={{
			start: new CalendarDate(2026, 9, 10),
			end: new CalendarDate(2026, 9, 12)
		}}
		isDateUnavailable={(candidate) => candidate.day === 20}
		locale="en-US"
		name="date"
		onValueChange={() => (dateChanges += 1)}
		size="large"
		timeZone="UTC"
	/>
	<ZPeriodCalendar
		bind:value={period}
		calendarLabel="Custom period calendar"
		data-testid="period-calendar-content"
		defaultFocusedValue={monthPeriod(2026, 5)}
		dir="rtl"
		granularity="month"
		header={periodHeader}
		name="period"
		onValueChange={() => (periodChanges += 1)}
		{periodCell}
		size="small"
	/>
</form>

<ZDatePicker
	calendarHeader={dateHeader}
	calendarLabel="Custom date picker calendar"
	data-testid="custom-date-picker"
	defaultValue={new CalendarDate(2026, 9, 15)}
	{dateCell}
	locale="en-US"
	timeZone="UTC"
/>
<ZDateRangePicker
	calendarHeader={dateHeader}
	calendarLabel="Custom date range picker calendar"
	data-testid="custom-date-range-picker"
	defaultValue={{ start: new CalendarDate(2026, 9, 10), end: new CalendarDate(2026, 9, 15) }}
	{dateCell}
	locale="en-US"
	timeZone="UTC"
/>
<ZPeriodPicker
	calendarLabel="Custom period picker calendar"
	data-testid="custom-period-picker"
	defaultValue={monthPeriod(2026, 5)}
	granularity="month"
	header={periodHeader}
	locale="en-US"
	{periodCell}
/>

<output data-testid="calendar-content-output"
	>{date?.toString() ?? 'null'}|{period
		? serializePeriod(period)
		: 'null'}|{dateChanges}|{periodChanges}</output
>
