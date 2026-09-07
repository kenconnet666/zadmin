<script lang="ts">
	import { Time } from '@internationalized/date';
	import ZButton from '../src/components/gene/ZButton.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZField from '../src/components/input/ZField.svelte';
	import ZTimeRangePicker from '../src/components/input/ZTimeRangePicker.svelte';
	import type { TimeRangeValue } from '../src/runtime/time-range.js';
	import { zhCNLocalePack } from '../src/runtime/foundation/locale.js';

	const initial: TimeRangeValue = { start: new Time(9, 30), end: new Time(10, 30) };
	let value = $state<TimeRangeValue | null>(initial);
	let partial = $state<TimeRangeValue | null>({ start: null, end: new Time(17) });
	let rejected = $state<TimeRangeValue | null>(initial);
	let rejectedAttempts = $state(0);
	let changes = $state(0);
	let commits = $state(0);

	function readRejected(): TimeRangeValue | null {
		return rejected;
	}

	function rejectValue(): void {
		rejectedAttempts += 1;
	}
</script>

<ZProvider locale="en-US">
	<form data-testid="time-range-form">
		<ZField description="Deployment window" label="Deployment range" name="deployment" required>
			<ZTimeRangePicker
				bind:value
				data-testid="time-range"
				defaultValue={initial}
				granularity="minute"
				hourCycle={24}
				isTimeUnavailable={(_candidate, part, range) => part === 'end' && range.end?.hour === 12}
				maxValue={new Time(13)}
				minValue={new Time(8)}
				onCommit={() => (commits += 1)}
				onValueChange={() => (changes += 1)}
				presets={[{ label: 'Morning shift', value: { start: new Time(8), end: new Time(11) } }]}
				size="large"
			/>
		</ZField>
		<ZTimeRangePicker
			allowEmpty
			bind:value={partial}
			data-testid="time-range-partial"
			hourCycle={24}
			name="partial"
		/>
		<ZTimeRangePicker
			bind:value={readRejected, rejectValue}
			data-testid="time-range-rejected"
			hourCycle={24}
			name="rejected"
		/>
		<ZTimeRangePicker
			data-testid="time-range-readonly"
			defaultValue={initial}
			name="readonly-window"
			readonly
		/>
		<ZTimeRangePicker
			data-testid="time-range-disabled"
			defaultValue={initial}
			disabled
			name="disabled-window"
		/>
		<ZButton
			data-testid="time-range-external"
			onclick={() => (value = { start: new Time(8), end: new Time(9) })}
		>
			External sync
		</ZButton>
		<button type="reset">Reset</button>
	</form>
</ZProvider>

<ZProvider direction="rtl" locale="zh-CN" localePack={zhCNLocalePack}>
	<ZTimeRangePicker
		data-testid="time-range-overnight"
		defaultValue={{ start: new Time(23), end: new Time(1) }}
		dir="ltr"
		hourCycle={24}
		presets={[{ label: '夜班', value: { start: new Time(22), end: new Time(2) } }]}
		rangeMode="overnight"
	/>
</ZProvider>

<output data-testid="time-range-output"
	>{value?.start?.toString() ?? 'null'}|{value?.end?.toString() ?? 'null'}
	|{changes}|{commits}</output
>
<output data-testid="time-range-partial-output"
	>{partial?.start?.toString() ?? 'null'}
	|{partial?.end?.toString() ?? 'null'}</output
>
<output data-testid="time-range-rejected-output"
	>{rejected?.start?.toString() ?? 'null'}
	|{rejected?.end?.toString() ?? 'null'}|{rejectedAttempts}</output
>
