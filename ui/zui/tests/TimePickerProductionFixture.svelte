<script lang="ts">
	import { Time } from '@internationalized/date';
	import ZField from '../src/components/input/ZField.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZTimePicker from '../src/components/input/ZTimePicker.svelte';

	const initial = new Time(9, 30, 15);
	let value = $state<Time | null>(initial);
	let bounded = $state<Time | null>(null);
	let exact = $state<Time | null>(null);
	let presetValue = $state<Time | null>(new Time(7, 15, 10, 500));
	let rejected = $state<Time | null>(initial);
	let rejectedAttempts = $state(0);
	let lazyPresetCalls = $state(0);

	function lazyPreset(): Time {
		lazyPresetCalls += 1;
		return new Time(11, 22, 33, lazyPresetCalls);
	}

	function readRejected(): Time | null {
		return rejected;
	}

	function rejectValue(): void {
		rejectedAttempts += 1;
	}
</script>

<ZProvider locale="en-US">
	<form data-testid="time-picker-form">
		<ZField description="Deployment wall clock" label="Deployment time" name="deployment" required>
			<ZTimePicker
				bind:value
				data-testid="time-picker"
				defaultValue={initial}
				granularity="second"
				hourCycle={24}
			/>
		</ZField>
		<ZTimePicker
			bind:value={bounded}
			data-testid="time-picker-bounded"
			granularity="minute"
			hourCycle={24}
			maxValue={new Time(10, 45)}
			minValue={new Time(10, 30)}
			name="bounded"
			pickerLabel="Bounded time"
		/>
		<ZTimePicker
			bind:value={exact}
			data-testid="time-picker-exact"
			hourCycle={24}
			isTimeUnavailable={(candidate) => candidate.compare(new Time(10, 30)) !== 0}
			name="exact"
			pickerLabel="Exact time"
		/>
		<ZTimePicker
			data-testid="time-picker-empty"
			hourCycle={24}
			isTimeUnavailable={() => true}
			pickerLabel="Unavailable time"
		/>
		<ZTimePicker
			data-testid="time-picker-narrow"
			defaultValue={new Time(13, 45, 30)}
			granularity="second"
			hourCycle={12}
			pickerLabel="Narrow time"
			size="xlarge"
		/>
		<ZTimePicker
			data-testid="time-picker-instance-rtl"
			defaultValue={new Time(9, 30)}
			dir="rtl"
			hourCycle={24}
			pickerLabel="Instance RTL time"
		/>
		<ZTimePicker
			data-testid="time-picker-disabled"
			defaultValue={new Time(9, 30)}
			disabled
			hourCycle={24}
		/>
		<ZTimePicker
			bind:value={presetValue}
			data-testid="time-picker-actions"
			granularity="second"
			hourCycle={24}
			name="actions"
			pickerLabel="Action time"
			presets={[
				{ label: 'Static preset', value: new Time(8, 20, 30, 250) },
				{ label: 'Lazy preset', value: lazyPreset }
			]}
			showNow
			timeZone="Asia/Shanghai"
		/>
		<ZTimePicker
			data-testid="time-picker-now-invalid"
			hourCycle={24}
			invalidTimeLabel="Current time is outside the allowed range"
			isTimeUnavailable={() => true}
			pickerLabel="Invalid current time"
			showNow
			timeZone="Pacific/Kiritimati"
		/>
		<ZTimePicker
			data-testid="time-picker-disabled"
			defaultValue={new Time(6, 30)}
			disabled
			name="disabled-time"
			presets={[{ label: 'Disabled preset', value: new Time(8) }]}
			showNow
		/>
		<ZTimePicker
			data-testid="time-picker-readonly"
			defaultValue={new Time(6, 45)}
			name="readonly-time"
			presets={[{ label: 'Readonly preset', value: new Time(8) }]}
			readonly
			showNow
		/>
		<ZTimePicker
			bind:value={readRejected, rejectValue}
			data-testid="time-picker-rejected"
			granularity="second"
			hourCycle={24}
			name="rejected"
			pickerLabel="Rejected time"
			presets={[{ label: 'Rejected preset', value: new Time(16, 45, 30, 125) }]}
		/>
		<button
			data-testid="time-picker-external"
			onclick={() => (value = new Time(14, 45, 30, 125))}
			type="button"
		>
			Set time externally
		</button>
		<button type="reset">Reset</button>
	</form>
</ZProvider>
<output data-testid="time-picker-output">{value?.toString() ?? 'null'}</output>
<output data-testid="time-picker-bounded-output">{bounded?.toString() ?? 'null'}</output>
<output data-testid="time-picker-exact-output">{exact?.toString() ?? 'null'}</output>
<output data-testid="time-picker-actions-output"
	>{presetValue?.toString() ?? 'null'}:{lazyPresetCalls}</output
>
<output data-testid="time-picker-rejected-output"
	>{rejected?.toString() ?? 'null'}:{rejectedAttempts}</output
>
