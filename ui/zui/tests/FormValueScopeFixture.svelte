<script lang="ts">
	import { CalendarDate, Time } from '@internationalized/date';
	import ZForm from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZField from '../src/components/input/ZField.svelte';
	import ZInput from '../src/components/input/ZInput.svelte';
	import ZDateField from '../src/components/input/ZDateField.svelte';
	import ZTimeField from '../src/components/input/ZTimeField.svelte';
	import ZCalendar from '../src/components/input/ZCalendar.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';
	const model = createFormModel({ defaultValues: { text: 'keep' } });
</script>

<ZForm {model}>
	<ZFormField name="text" label="Business value">
		<ZInput />
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
	</ZFormField>
</ZForm>
