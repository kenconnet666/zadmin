<script lang="ts">
	import { CalendarDateTime } from '@internationalized/date';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZDateTimePicker from '../src/components/input/ZDateTimePicker.svelte';
	import ZDateTimeRangePicker from '../src/components/input/ZDateTimeRangePicker.svelte';
	import ZForm from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';
	import type { DateTimeRangeValue } from '../src/runtime/date-time-range.js';
	let {
		variant = 'single'
	}: { variant?: 'single' | 'range' | 'readonly' | 'disabled' | 'rejected' | 'immediate' } =
		$props();
	const initial = new CalendarDateTime(2026, 9, 7, 9, 30);
	const preset = new CalendarDateTime(2026, 9, 8, 14, 30);
	let value = $state<CalendarDateTime | null>(initial);
	let range = $state<DateTimeRangeValue<'local'> | null>({
		start: initial,
		end: initial.set({ hour: 18 })
	});
	let changes = $state(0);
	let commits = $state(0);
	const rejectedOwner = { appointment: initial as CalendarDateTime | null };
	const rejectedModel = createFormModel({
		defaultValues: rejectedOwner,
		read: () => rejectedOwner,
		write: () => undefined
	});
	export function replaceExternal() {
		value = new CalendarDateTime(2027, 2, 12, 10, 15);
	}
</script>

<ZProvider locale="en-US" timeZone="UTC">
	{#if variant === 'rejected'}
		<ZForm model={rejectedModel} data-testid="inline-form">
			<ZFormField name="appointment" label="Appointment">
				<ZDateTimePicker
					data-testid="inline-picker"
					presentation="inline"
					hourCycle={24}
					presets={[{ label: 'Afternoon', value: preset }]}
					onValueChange={() => changes++}
					onCommit={() => commits++}
				/>
			</ZFormField>
		</ZForm>
	{:else}
		<form data-testid="inline-form">
			{#if variant === 'range'}
				<ZDateTimeRangePicker
					data-testid="inline-picker"
					presentation="inline"
					bind:value={range}
					defaultValue={{ start: initial, end: initial.set({ hour: 18 }) }}
					hourCycle={24}
					name="window"
					presets={[{ label: 'Tomorrow', value: { start: preset, end: preset.set({ hour: 18 }) } }]}
					onValueChange={() => changes++}
					onCommit={() => commits++}
				/>
			{:else}
				<ZDateTimePicker
					data-testid="inline-picker"
					presentation="inline"
					bind:value
					defaultValue={initial}
					hourCycle={24}
					name="appointment"
					commitMode={variant === 'immediate' ? 'immediate' : 'confirm'}
					readonly={variant === 'readonly'}
					disabled={variant === 'disabled'}
					presets={[{ label: 'Afternoon', value: preset }]}
					onValueChange={() => changes++}
					onCommit={() => commits++}
				/>
			{/if}
			<button type="reset">Reset inline</button>
		</form>
	{/if}
</ZProvider>
<output data-testid="inline-events">{changes}|{commits}</output>
