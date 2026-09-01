<script lang="ts">
	import { CalendarDate, Time } from '@internationalized/date';
	import {
		ZCalendar,
		ZDateField,
		ZDatePicker,
		ZDateRangePicker,
		ZField,
		ZProvider,
		ZTimeField,
		type CalendarRange,
		type CalendarRangeValue
	} from '../src/entrypoints/index.js';

	const dateDefault = new CalendarDate(2026, 8, 18);
	const rangeDefault: CalendarRange = {
		end: new CalendarDate(2026, 8, 21),
		start: new CalendarDate(2026, 8, 18)
	};
	let calendar = $state<CalendarDate | null>(dateDefault);
	let date = $state<CalendarDate | null>(dateDefault);
	let time = $state<Time | null>(new Time(9, 30, 15));
	let picked = $state<CalendarDate | null>(dateDefault);
	let range = $state<CalendarRangeValue | null>(rangeDefault);
</script>

<ZProvider timeZone="Pacific/Kiritimati"
	><form data-testid="date-form">
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
		<ZField description="Deployment date" label="Picked date" name="picked" required>
			<ZDatePicker
				bind:value={picked}
				calendarLabel="Picker calendar"
				defaultValue={dateDefault}
				locale="en-US"
				triggerLabel={(display) => `Pick date ${display}`}
			/>
		</ZField>
		<ZField description="Deployment window" label="Date range" name="range" required>
			<ZDateRangePicker
				bind:value={range}
				calendarLabel="Range calendar"
				defaultValue={rangeDefault}
				locale="en-US"
			/>
		</ZField>
		<ZDatePicker
			data-testid="readonly-date-picker"
			defaultValue={dateDefault}
			name="readonly-date"
			readonly
		/>
		<ZDateRangePicker
			data-testid="readonly-date-range-picker"
			defaultValue={rangeDefault}
			name="readonly-range"
			readonly
		/>
		<button type="reset">Reset</button>
		<output data-testid="date-output"
			>{calendar?.toString() ?? 'empty'}:{date?.toString() ?? 'empty'}:{time?.toString() ??
				'empty'}:{picked?.toString() ?? 'empty'}:{range?.start?.toString() ??
				'empty'}:{range?.end?.toString() ?? 'empty'}</output
		>
	</form></ZProvider
>
