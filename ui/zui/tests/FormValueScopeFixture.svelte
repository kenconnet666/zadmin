<script lang="ts">
	import { CalendarDate, CalendarDateTime, Time } from '@internationalized/date';
	import ZForm from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZField from '../src/components/input/ZField.svelte';
	import ZInput from '../src/components/input/ZInput.svelte';
	import ZDateField from '../src/components/input/ZDateField.svelte';
	import ZDateTimeField from '../src/components/input/ZDateTimeField.svelte';
	import ZTimeField from '../src/components/input/ZTimeField.svelte';
	import ZCalendar from '../src/components/input/ZCalendar.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';
	const model = createFormModel({ defaultValues: { text: 'keep' } });
</script>

{#snippet dateTimeSuffix()}
	<ZInput
		aria-label="Suffix scope probe"
		data-testid="date-time-none-suffix"
		defaultValue="suffix-local"
	/>
{/snippet}

<ZForm {model} data-testid="form-value-scope-form">
	<ZFormField name="text" label="Business value">
		<ZInput data-testid="form-value-scope-owner" />
		<ZField label="Date preview"
			><ZDateField
				formParticipation="none"
				name="ignored-date"
				value={new CalendarDate(2026, 9, 7)}
			/></ZField
		>
		<ZField label="Time preview"
			><ZTimeField formParticipation="none" name="ignored-time" value={new Time(10, 30)} /></ZField
		>
		<ZField label="Calendar preview"
			><ZCalendar
				formParticipation="none"
				name="ignored-calendar"
				value={new CalendarDate(2026, 9, 7)}
			/></ZField
		>
		<ZField label="Date time preview">
			<ZDateTimeField
				defaultValue={new CalendarDateTime(2026, 9, 7, 10, 30)}
				formParticipation="none"
				name="ignored-date-time"
				suffixAction={dateTimeSuffix}
			/>
		</ZField>
	</ZFormField>
</ZForm>
