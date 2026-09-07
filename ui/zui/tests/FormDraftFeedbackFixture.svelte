<script lang="ts">
	import { Time } from '@internationalized/date';
	import type { StandardSchemaV1 } from '@standard-schema/spec';
	import ZForm, { type ZFormController } from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZTimeField from '../src/components/input/ZTimeField.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';
	type Values = { time: Time | null };
	const model = createFormModel<Values>({ defaultValues: { time: new Time(9, 30) } });
	let controller = $state<ZFormController<Values, Values> | null>(null);
	let visible = $state(true);
	let fieldVisible = $state(true);
	let deferred = false;
	let completeValidation: (() => void) | undefined;
	let submissions = $state(0);
	const schema: StandardSchemaV1<Values, Values> = {
		'~standard': {
			version: 1,
			vendor: 'draft-feedback',
			validate(input) {
				if (!deferred) return { value: input as Values };
				deferred = false;
				return new Promise((resolve) => {
					completeValidation = () => resolve({ value: input as Values });
				});
			}
		}
	};
	export const getState = () => controller!.getState();
	export const fieldState = () => controller!.getFieldState('time');
	export const validate = () => controller!.validate();
	export const clearErrors = () => controller!.clearErrors();
	export const resetField = () => controller!.resetField('time');
	export const canonical = () => model.values.time?.toString();
	export const removeControl = () => {
		visible = false;
	};
	export const removeField = () => {
		fieldVisible = false;
	};
	export const deferNext = () => {
		deferred = true;
	};
	export const finishValidation = () => completeValidation?.();
</script>

<ZForm
	{model}
	{schema}
	bind:controller
	onValidSubmit={() => {
		submissions += 1;
	}}
>
	<fieldset>
		{#if fieldVisible}
			<ZFormField name="time" label="Appointment time">
				{#if visible}<ZTimeField hourCycle={24} />{/if}
			</ZFormField>
		{/if}
	</fieldset>
	<button type="submit">Submit</button>
	<output data-submissions>{submissions}</output>
</ZForm>
