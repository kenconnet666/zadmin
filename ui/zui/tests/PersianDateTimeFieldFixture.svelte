<script lang="ts">
	import { CalendarDateTime, createCalendar } from '@internationalized/date';

	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZDateTimeField from '../src/components/input/ZDateTimeField.svelte';

	let value = $state<CalendarDateTime | null>(
		new CalendarDateTime(createCalendar('persian'), 'AP', 1403, 1, 1, 13, 5, 9, 125)
	);
	let changes = $state(0);
</script>

<ZProvider locale="fa-IR-u-ca-persian" timeZone="Asia/Tehran">
	<form data-testid="persian-date-time-form">
		<ZDateTimeField
			bind:value
			data-testid="persian-date-time-field"
			granularity="second"
			hourCycle={24}
			name="meeting"
			onValueChange={() => (changes += 1)}
		/>
	</form>
</ZProvider>

<output data-testid="persian-date-time-output"
	>{value
		? `${value.calendar.identifier}:${value.year}-${value.month}-${value.day}:${value.hour}:${value.minute}:${value.second}:${value.millisecond}`
		: 'null'}|{changes}</output
>
