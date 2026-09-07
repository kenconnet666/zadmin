<script lang="ts">
	import {
		CalendarDateTime,
		parseZonedDateTime,
		type ZonedDateTime
	} from '@internationalized/date';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZDateTimePicker from '../src/components/input/ZDateTimePicker.svelte';
	import ZField from '../src/components/input/ZField.svelte';
	import ZForm from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';

	const localPreset = new CalendarDateTime(2026, 9, 12, 12, 15);
	const zonedPreset = parseZonedDateTime('2026-09-12T11:45-07:00[America/Los_Angeles]');
	let local = $state<CalendarDateTime | null>(new CalendarDateTime(2026, 9, 7, 9, 30));
	let zoned = $state<ZonedDateTime | null>(
		parseZonedDateTime('2026-09-07T09:30-07:00[America/Los_Angeles]')
	);
	let localOpen = $state(false);
	let zonedOpen = $state(false);
	let localChanges = $state(0);
	let localCommits = $state(0);
	let zonedChanges = $state(0);
	let zonedCommits = $state(0);
	let gatedDisabled = $state(true);
	let gatedOpen = $state(true);
	let gatedOpenChanges = $state(0);

	const rejectedValue = new CalendarDateTime(2026, 9, 11, 10, 30);
	const rejectedOwner = $state({ value: rejectedValue as CalendarDateTime | null });
	const rejectedModel = createFormModel({
		defaultValues: { value: rejectedValue as CalendarDateTime | null },
		read: () => rejectedOwner,
		write: () => undefined
	});

	export function writeExternalLocal(): void {
		local = new CalendarDateTime(2026, 10, 5, 14, 20);
	}

	export function enableGatedPicker(): void {
		gatedDisabled = false;
	}
</script>

<ZProvider direction="ltr" locale="en-US" timeZone="America/New_York">
	<form data-testid="date-time-picker-form">
		<ZField label="Confirm appointment" name="appointment">
			<ZDateTimePicker
				bind:open={localOpen}
				bind:value={local}
				data-testid="confirm-date-time-picker"
				defaultValue={new CalendarDateTime(2026, 9, 7, 9, 30)}
				onCommit={() => (localCommits += 1)}
				onValueChange={() => (localChanges += 1)}
				presets={[{ label: 'Lunch', value: localPreset }]}
				showNow
			/>
		</ZField>
		<ZField label="Immediate appointment" name="zonedAppointment">
			<ZDateTimePicker
				bind:open={zonedOpen}
				bind:value={zoned}
				commitMode="immediate"
				data-testid="immediate-date-time-picker"
				defaultValue={parseZonedDateTime('2026-09-07T09:30-07:00[America/Los_Angeles]')}
				dir="rtl"
				mode="zoned"
				onCommit={() => (zonedCommits += 1)}
				onValueChange={() => (zonedChanges += 1)}
				presets={[{ label: 'West coast', value: zonedPreset }]}
				showNow
			/>
		</ZField>
		<button type="reset">Reset picker form</button>
	</form>
</ZProvider>

<ZDateTimePicker
	bind:open={gatedOpen}
	data-testid="gated-date-time-picker"
	disabled={gatedDisabled}
	onOpenChange={() => (gatedOpenChanges += 1)}
	value={new CalendarDateTime(2026, 9, 7, 9, 30)}
/>

<ZForm model={rejectedModel} data-testid="rejected-date-time-picker-form">
	<ZFormField label="Rejected appointment" name="value">
		<ZDateTimePicker
			data-testid="rejected-date-time-picker"
			presets={[{ label: 'Rejected lunch', value: localPreset }]}
		/>
	</ZFormField>
</ZForm>

<output data-testid="confirm-date-time-picker-output"
	>{local?.toString() ?? 'null'}|{localChanges}|{localCommits}|{localOpen}</output
>
<output data-testid="immediate-date-time-picker-output"
	>{zoned?.toString() ?? 'null'}|{zonedChanges}|{zonedCommits}|{zonedOpen}</output
>
<output data-testid="gated-date-time-picker-output"
	>{gatedOpen}|{gatedDisabled}|{gatedOpenChanges}</output
>
