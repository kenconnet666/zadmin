<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import ZCalendar from '../src/components/input/ZCalendar.svelte';
	import ZDateField from '../src/components/input/ZDateField.svelte';
	import ZDatePicker from '../src/components/input/ZDatePicker.svelte';
	import ZDateRangePicker from '../src/components/input/ZDateRangePicker.svelte';
	import ZForm from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZTimeField from '../src/components/input/ZTimeField.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';

	type Kind =
		| 'calendar'
		| 'conflict'
		| 'date-field'
		| 'picker'
		| 'range'
		| 'range-shape'
		| 'string'
		| 'time-field';
	let { kind }: { kind: Kind } = $props();
	const invalidValue =
		kind === 'range'
			? { start: new Date(), end: null }
			: kind === 'range-shape'
				? { start: new CalendarDate(2026, 9, 7) }
				: kind === 'string'
					? '2026-09-07'
					: new Date();
	const model = createFormModel({ defaultValues: { value: invalidValue as unknown } });
</script>

<ZForm {model}>
	<ZFormField name="value" label="Invalid date model value">
		{#if kind === 'calendar'}
			<ZCalendar />
		{:else if kind === 'date-field'}
			<ZDateField />
		{:else if kind === 'time-field'}
			<ZTimeField />
		{:else if kind === 'picker'}
			<ZDatePicker />
		{:else if kind === 'range' || kind === 'range-shape'}
			<ZDateRangePicker />
		{:else if kind === 'string'}
			<ZDateField />
		{:else}
			<ZDatePicker value={new CalendarDate(2026, 9, 7)} />
		{/if}
	</ZFormField>
</ZForm>
