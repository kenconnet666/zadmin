<script lang="ts">
	import { Time } from '@internationalized/date';
	import ZField from '../src/components/input/ZField.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZTimePicker from '../src/components/input/ZTimePicker.svelte';

	const initial = new Time(9, 30, 15);
	let value = $state<Time | null>(initial);
	let bounded = $state<Time | null>(null);
	let exact = $state<Time | null>(null);
	let rejected = $state<Time | null>(initial);
	let rejectedAttempts = $state(0);

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
			bind:value={readRejected, rejectValue}
			data-testid="time-picker-rejected"
			granularity="second"
			hourCycle={24}
			name="rejected"
			pickerLabel="Rejected time"
		/>
		<button type="reset">Reset</button>
	</form>
</ZProvider>
<output data-testid="time-picker-output">{value?.toString() ?? 'null'}</output>
<output data-testid="time-picker-bounded-output">{bounded?.toString() ?? 'null'}</output>
<output data-testid="time-picker-exact-output">{exact?.toString() ?? 'null'}</output>
<output data-testid="time-picker-rejected-output"
	>{rejected?.toString() ?? 'null'}:{rejectedAttempts}</output
>
