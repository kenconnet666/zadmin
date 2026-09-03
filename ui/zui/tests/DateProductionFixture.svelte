<script lang="ts">
	import { CalendarDate, Time } from '@internationalized/date';
	import {
		ZButton,
		ZCalendar,
		ZDateField,
		ZDatePicker,
		ZDateRangePicker,
		ZField,
		ZProvider,
		ZTimeField,
		type CalendarRangeValue
	} from '../src/entrypoints/index.js';

	const seed = new CalendarDate(2026, 9, 16);
	let focused = $state(new CalendarDate(2026, 9, 14));
	let calendar = $state<CalendarDate | null>(null);
	let date = $state<CalendarDate | null>(null);
	let time = $state<Time | null>(null);
	let picked = $state<CalendarDate | null>(null);
	let pickerOpen = $state(false);
	let range = $state<CalendarRangeValue | null>({ end: null, start: seed });
	let rangeOpen = $state(false);
	const weekdayUnavailable = (value: CalendarDate) => value.toDate('UTC').getUTCDay() % 6 === 0;
</script>

<ZProvider direction="rtl" locale="ar-EG" timeZone="Asia/Shanghai">
	<form data-testid="date-production-form">
		<ZCalendar
			bind:focusedValue={focused}
			bind:value={calendar}
			data-testid="production-calendar"
			isDateUnavailable={weekdayUnavailable}
			minValue={new CalendarDate(2026, 9, 10)}
			maxValue={new CalendarDate(2026, 10, 10)}
			name="calendar"
		/>
		<ZField label="Production date" name="date" required>
			<ZDateField
				bind:value={date}
				data-testid="production-date-field"
				isDateUnavailable={weekdayUnavailable}
			/>
		</ZField>
		<ZField label="Production time" name="time">
			<ZTimeField
				bind:value={time}
				data-testid="production-time-field"
				granularity="second"
				hourCycle={12}
				minuteStep={15}
			/>
		</ZField>
		<ZField label="Controlled picker" name="picked">
			<ZDatePicker
				bind:open={pickerOpen}
				bind:value={picked}
				data-testid="production-date-picker"
				isDateUnavailable={weekdayUnavailable}
			/>
		</ZField>
		<ZField label="Partial range" name="window">
			<ZDateRangePicker
				bind:open={rangeOpen}
				bind:value={range}
				data-testid="production-range-picker"
				isDateUnavailable={(value, part) =>
					part === 'start' ? weekdayUnavailable(value) : value.day === 30}
			/>
		</ZField>
		<ZDatePicker data-testid="production-readonly-picker" defaultValue={seed} readonly />
		<ZButton
			data-testid="production-clear"
			onclick={() => {
				calendar = null;
				date = null;
				time = null;
				picked = null;
				range = null;
			}}>Clear owners</ZButton
		>
		<ZButton
			data-testid="production-open"
			onclick={() => {
				pickerOpen = true;
				rangeOpen = true;
			}}>Open owners</ZButton
		>
		<ZButton
			data-testid="production-reverse"
			onclick={() => {
				range = {
					start: new CalendarDate(2026, 9, 28),
					end: new CalendarDate(2026, 9, 20)
				};
			}}>Write reversed range</ZButton
		>
		<button type="reset">Reset</button>
	</form>
</ZProvider>
<output data-testid="date-production-output">
	{focused.toString()}|{calendar?.toString() ?? 'null'}|{date?.toString() ??
		'null'}|{time?.toString() ?? 'null'}|{picked?.toString() ?? 'null'}|{range?.start?.toString() ??
		'null'}|{range?.end?.toString() ?? 'null'}|{pickerOpen}|{rangeOpen}
</output>
