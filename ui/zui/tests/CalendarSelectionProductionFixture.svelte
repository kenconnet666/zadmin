<script lang="ts">
	import { CalendarDate, type CalendarDate as CalendarDateValue } from '@internationalized/date';
	import ZCalendar from '../src/components/input/ZCalendar.svelte';
	import type { CalendarRangeValue } from '../src/runtime/date.js';

	let multiple = $state<readonly CalendarDateValue[]>([
		new CalendarDate(2026, 9, 10),
		new CalendarDate(2026, 9, 5)
	]);
	let range = $state<CalendarRangeValue | null>(null);
	let nonContiguous = $state<CalendarRangeValue | null>(null);
	let focused = $state(new CalendarDate(2026, 9, 15));
</script>

<ZCalendar
	data-testid="calendar-highlight"
	defaultValue={new CalendarDate(2026, 9, 10)}
	highlightRange={{ start: new CalendarDate(2026, 9, 11), end: new CalendarDate(2026, 9, 13) }}
/>

<form data-testid="calendar-selection-form">
	<ZCalendar
		bind:focusedValue={focused}
		bind:value={multiple}
		data-testid="calendar-multiple"
		defaultFocusedValue={new CalendarDate(2026, 9, 15)}
		firstDayOfWeek="mon"
		name="days"
		required
		selectionMode="multiple"
		showWeekNumbers
		visibleMonths={3}
		weekNumbering="iso"
	/>
	<ZCalendar
		bind:value={range}
		data-testid="calendar-range"
		defaultFocusedValue={new CalendarDate(2026, 9, 14)}
		isDateUnavailable={(date) => date.year === 2026 && date.month === 9 && date.day === 15}
		name="window"
		selectionMode="range"
		visibleMonths={2}
	/>
	<ZCalendar
		allowNonContiguousRange
		bind:value={nonContiguous}
		data-testid="calendar-range-noncontiguous"
		defaultFocusedValue={new CalendarDate(2026, 9, 14)}
		isDateUnavailable={(date) => date.year === 2026 && date.month === 9 && date.day === 15}
		name="bridge"
		selectionMode="range"
	/>
	<ZCalendar
		allowEmpty
		data-testid="calendar-range-allow-empty"
		selectionMode="range"
		value={{ start: new CalendarDate(2026, 9, 14), end: null }}
	/>
	<ZCalendar
		data-testid="calendar-invalid-external"
		isDateUnavailable={(date) => date.day === 15}
		value={new CalendarDate(2026, 9, 15)}
	/>
	<button type="reset">Reset</button>
</form>
<button
	data-testid="calendar-focus-second"
	onclick={() => (focused = new CalendarDate(2026, 10, 15))}
>
	Focus October
</button>
<ZCalendar
	data-testid="calendar-maximum"
	defaultFocusedValue={new CalendarDate(9999, 12, 31)}
	showWeekNumbers
	visibleMonths={12}
/>
<output data-testid="calendar-multiple-output">{multiple.map(String).join(',')}</output>
<output data-testid="calendar-range-output"
	>{range?.start?.toString() ?? 'null'}|{range?.end?.toString() ?? 'null'}</output
>
