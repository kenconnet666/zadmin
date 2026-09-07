<script lang="ts">
	import { Time } from '@internationalized/date';

	import ZTimeValue from '../src/components/data-display/ZTimeValue.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZField from '../src/components/input/ZField.svelte';
	import ZTimeGrid, { type TimeGridSlot } from '../src/components/input/ZTimeGrid.svelte';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const initial = new Time(9);
	const slots = Object.freeze<readonly TimeGridSlot[]>([
		Object.freeze({ label: 'Early', value: new Time(8) }),
		Object.freeze({ value: initial }),
		Object.freeze({ label: 'Lunch window', value: new Time(10, 30, 15, 250) }),
		Object.freeze({ value: new Time(11) }),
		Object.freeze({ value: new Time(12) })
	]);
	let value = $state<Time | null>(initial);
	let changes = $state(0);
	let rejected = $state<Time | null>(initial);
	let rejectedAttempts = $state(0);
	let dynamicSlots = $state<readonly TimeGridSlot[]>(slots.slice(0, 3));
	let rtlValue = $state<Time | null>(initial);

	function readRejected(): Time | null {
		return rejected;
	}

	function rejectValue(): void {
		rejectedAttempts += 1;
	}

	export function setExternalUnavailable(): void {
		value = new Time(11);
	}

	export function setExternalMissing(): void {
		value = new Time(13);
	}

	export function removeDynamicMiddle(): void {
		dynamicSlots = [slots[0]!, slots[2]!];
	}

	export function restoreDynamicMiddle(): void {
		dynamicSlots = slots.slice(0, 3);
	}
</script>

<ZProvider locale="en-US" timeZone="UTC">
	<form data-testid="time-grid-form">
		<ZField label="Appointment time" description="Choose an available slot" name="appointment">
			<ZTimeGrid
				bind:value
				allowDeselect
				columns={3}
				data-testid="time-grid-main"
				defaultValue={initial}
				granularity="second"
				isTimeUnavailable={(candidate) => candidate.hour === 11}
				minValue={new Time(8, 30)}
				onValueChange={() => (changes += 1)}
				required
				size="large"
				{slots}
			/>
		</ZField>
		<ZTimeGrid
			bind:value={readRejected, rejectValue}
			data-testid="time-grid-rejected"
			gridLabel="Rejected appointment"
			{slots}
		/>
		<ZTimeGrid
			data-testid="time-grid-readonly"
			gridLabel="Readonly appointment"
			name="readonly-time"
			readonly
			{slots}
			value={initial}
		/>
		<ZTimeGrid
			data-testid="time-grid-disabled"
			disabled
			gridLabel="Disabled appointment"
			name="disabled-time"
			{slots}
			value={initial}
		/>
		<ZTimeGrid
			data-testid="time-grid-none"
			formParticipation="none"
			gridLabel="Unowned appointment"
			name="ignored-time"
			{slots}
			value={initial}
		/>
		<fieldset disabled data-testid="time-grid-fieldset">
			<legend>Unavailable schedule</legend>
			<ZTimeGrid
				data-testid="time-grid-native-disabled"
				gridLabel="Native disabled appointment"
				name="fieldset-time"
				{slots}
				value={initial}
			/>
		</fieldset>
		<button data-testid="time-grid-reset" type="reset">Reset time</button>
	</form>

	<ZTimeGrid
		bind:value={rtlValue}
		data-testid="time-grid-rtl"
		dir="rtl"
		gridLabel="RTL appointment"
		{slots}
	/>
	<ZTimeGrid data-testid="time-grid-dynamic" gridLabel="Dynamic appointment" slots={dynamicSlots} />
	<section data-testid="time-grid-sizes">
		{#each sizes as size (size)}
			<ZTimeGrid
				data-testid={'time-grid-size-' + size}
				gridLabel={'Appointment ' + size}
				{size}
				slots={[{ value: initial }]}
				value={initial}
			/>
		{/each}
	</section>

	<ZTimeValue
		data-testid="time-value-main"
		granularity="second"
		hourCycle={12}
		locale="en-US"
		size="large"
		tone="primary"
		value={new Time(13, 5, 9, 125)}
		weight="semibold"
	/>
	<ZTimeValue data-testid="time-value-hour" granularity="hour" value={new Time(6, 45)} />
</ZProvider>

<output data-testid="time-grid-output"
	>{value?.toString() ?? 'null'}|{changes}|{rejected?.toString() ??
		'null'}|{rejectedAttempts}</output
>
