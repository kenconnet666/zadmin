<script lang="ts">
	import { CalendarDateTime, parseZonedDateTime } from '@internationalized/date';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZDateTimeRangePicker from '../src/components/input/ZDateTimeRangePicker.svelte';
	import ZField from '../src/components/input/ZField.svelte';
	import ZForm from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';
	import type {
		LocalDateTimeRangeValue,
		ZonedDateTimeRangeValue
	} from '../src/runtime/date-time-range.js';

	const initial: LocalDateTimeRangeValue = {
		start: new CalendarDateTime(2026, 9, 7, 9, 30),
		end: new CalendarDateTime(2026, 9, 8, 17, 30)
	};
	const preset: LocalDateTimeRangeValue = {
		start: new CalendarDateTime(2026, 9, 11, 8),
		end: new CalendarDateTime(2026, 9, 12, 18)
	};
	let value = $state<LocalDateTimeRangeValue | null>(initial);
	let immediate = $state<LocalDateTimeRangeValue | null>(initial);
	let partial = $state<LocalDateTimeRangeValue | null>({ start: initial.start, end: null });
	let commits = $state(0);
	let immediateCommits = $state(0);
	let changes = $state(0);
	const rejectedOwner = { window: initial };
	const rejectedModel = createFormModel({
		defaultValues: rejectedOwner,
		read: () => rejectedOwner,
		write: () => undefined
	});
	let rejectedChanges = $state(0);
	let rejectedCommits = $state(0);
	const zoned: ZonedDateTimeRangeValue = {
		start: parseZonedDateTime('2026-11-01T01:30-04:00[America/New_York]'),
		end: parseZonedDateTime('2026-11-01T01:30-05:00[America/New_York]')
	};
</script>

<ZProvider locale="en-US" timeZone="America/New_York">
	<form data-testid="date-time-range-form">
		<ZField label="Deployment window" name="deployment" required>
			<ZDateTimeRangePicker
				bind:value
				data-testid="date-time-range"
				defaultValue={initial}
				granularity="minute"
				onCommit={() => (commits += 1)}
				onValueChange={() => (changes += 1)}
				presets={[{ label: 'Release window', value: () => preset }]}
				size="large"
			/>
		</ZField>
		<ZDateTimeRangePicker
			allowEmpty
			bind:value={partial}
			data-testid="date-time-range-partial"
			name="partial"
		/>
		<ZDateTimeRangePicker
			bind:value={immediate}
			commitMode="immediate"
			data-testid="date-time-range-immediate"
			onCommit={() => (immediateCommits += 1)}
			presets={[{ label: 'Immediate release', value: preset }]}
		/>
		<ZDateTimeRangePicker
			data-testid="date-time-range-boundary"
			defaultValue={{
				start: new CalendarDateTime(2026, 9, 8, 9, 30),
				end: new CalendarDateTime(2026, 9, 9, 17, 30)
			}}
			hourCycle={24}
			minValue={new CalendarDateTime(2026, 9, 7, 10)}
			name="boundary"
		/>
		<ZDateTimeRangePicker
			data-testid="date-time-range-readonly"
			defaultValue={initial}
			name="readonly-window"
			readonly
		/>
		<ZDateTimeRangePicker
			data-testid="date-time-range-disabled"
			defaultValue={initial}
			disabled
			name="disabled-window"
		/>
		<button type="reset">Reset</button>
	</form>
</ZProvider>

<ZForm model={rejectedModel} data-testid="date-time-range-rejected-form">
	<ZFormField name="window" label="Rejected range">
		<ZDateTimeRangePicker
			data-testid="date-time-range-rejected"
			hourCycle={24}
			onValueChange={() => {
				rejectedChanges += 1;
			}}
			onCommit={() => {
				rejectedCommits += 1;
			}}
		/>
	</ZFormField>
</ZForm>
<output data-testid="date-time-range-rejected-output">{rejectedChanges}:{rejectedCommits}</output>

<ZProvider direction="rtl" locale="en-US" timeZone="America/New_York">
	<form data-testid="date-time-range-zoned-form">
		<ZDateTimeRangePicker
			data-testid="date-time-range-zoned"
			defaultValue={zoned}
			dir="ltr"
			disambiguation="later"
			mode="zoned"
			name="zoned-window"
		/>
	</form>
</ZProvider>

<output data-testid="date-time-range-output"
	>{value?.start?.toString() ?? 'null'}|{value?.end?.toString() ?? 'null'}
	|{changes}|{commits}</output
>
<output data-testid="date-time-range-immediate-output"
	>{immediate?.start?.toString() ?? 'null'}
	|{immediate?.end?.toString() ?? 'null'}|{immediateCommits}</output
>
