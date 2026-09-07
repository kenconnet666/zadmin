<script lang="ts">
	import {
		CalendarDate,
		CalendarDateTime,
		parseZonedDateTime,
		Time,
		type ZonedDateTime
	} from '@internationalized/date';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZDateField from '../src/components/input/ZDateField.svelte';
	import ZDateTimeField from '../src/components/input/ZDateTimeField.svelte';
	import ZField from '../src/components/input/ZField.svelte';
	import ZForm from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZTimeField from '../src/components/input/ZTimeField.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';

	let local = $state<CalendarDateTime | null>(new CalendarDateTime(2026, 9, 7, 9, 30));
	let zoned = $state<ZonedDateTime | null>(
		parseZonedDateTime('2026-09-07T09:30-07:00[America/Los_Angeles]')
	);
	let rtl = $state<CalendarDateTime | null>(new CalendarDateTime(2026, 9, 7, 9, 30));
	const rejectedValue = new CalendarDateTime(2026, 9, 11, 10, 30);
	const rejectedOwner = $state({ value: rejectedValue as CalendarDateTime | null });
	const rejectedModel = createFormModel({
		defaultValues: { value: rejectedValue as CalendarDateTime | null },
		read: () => rejectedOwner,
		write: () => undefined
	});
</script>

<ZProvider locale="en-US" timeZone="America/New_York">
	<form data-testid="date-time-form">
		<ZField label="Local appointment" name="local">
			<ZDateTimeField bind:value={local} data-testid="local-date-time" granularity="second" />
		</ZField>
		<ZField label="Zoned appointment" name="zoned">
			<ZDateTimeField
				bind:value={zoned}
				data-testid="zoned-date-time"
				mode="zoned"
				timeZone="America/New_York"
			/>
		</ZField>
		<button type="reset">Reset</button>
	</form>
</ZProvider>

<ZProvider direction="ltr" locale="en-US" timeZone="UTC">
	<ZDateTimeField bind:value={rtl} data-testid="rtl-date-time" dir="rtl" />
	<ZDateField data-testid="rtl-date-field" defaultValue={new CalendarDate(2026, 9, 7)} dir="rtl" />
	<ZTimeField data-testid="rtl-time-field" defaultValue={new Time(9, 30)} dir="rtl" />
</ZProvider>

<ZForm model={rejectedModel} data-testid="date-time-rejected-form">
	<ZFormField name="value" label="Rejected date time">
		<ZDateTimeField data-testid="rejected-date-time" locale="en-US" timeZone="UTC" />
	</ZFormField>
</ZForm>

<output data-testid="local-date-time-output">{local?.toString() ?? 'null'}</output>
<output data-testid="zoned-date-time-output">{zoned?.toString() ?? 'null'}</output>
