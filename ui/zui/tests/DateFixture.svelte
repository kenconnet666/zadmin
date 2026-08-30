<script lang="ts">
	import { CalendarDate, Time } from '@internationalized/date';
	import {
		ZCalendar,
		ZDateField,
		ZDatePicker,
		ZDateRangePicker,
		ZTimeField,
		type CalendarRange
	} from '../src/entrypoints/index.js';

	const dateDefault = new CalendarDate(2026, 8, 18);
	const rangeDefault: CalendarRange = {
		end: new CalendarDate(2026, 8, 21),
		start: new CalendarDate(2026, 8, 18)
	};
	let calendar = $state(dateDefault);
	let date = $state(dateDefault);
	let time = $state(new Time(9, 30, 15));
	let picked = $state(dateDefault);
	let range = $state<CalendarRange>(rangeDefault);
</script>

<form data-testid="date-form">
	<ZCalendar
		bind:value={calendar}
		calendarLabel="Test calendar"
		defaultFocusedValue={dateDefault}
		defaultValue={dateDefault}
		firstDayOfWeek="mon"
		locale="en-US"
		name="calendar"
	/>
	<ZDateField
		aria-label="Date segments"
		bind:value={date}
		defaultValue={dateDefault}
		locale="en-US"
		name="date"
	/>
	<ZTimeField
		aria-label="Time segments"
		bind:value={time}
		defaultValue={new Time(9, 30, 15)}
		granularity="second"
		name="time"
	/>
	<ZDatePicker
		bind:value={picked}
		calendarLabel="Picker calendar"
		defaultValue={dateDefault}
		locale="en-US"
		name="picked"
		triggerLabel={(display) => `Pick date ${display}`}
	/>
	<ZDateRangePicker
		bind:value={range}
		calendarLabel="Range calendar"
		defaultValue={rangeDefault}
		locale="en-US"
		name="range"
	/>
	<button type="reset">Reset</button>
	<output data-testid="date-output"
		>{calendar.toString()}:{date.toString()}:{time.toString()}:{picked.toString()}:{range.start.toString()}:{range.end.toString()}</output
	>
</form>
