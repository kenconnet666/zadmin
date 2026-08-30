<script lang="ts">
	import {
		ZForm,
		ZFormField,
		ZInput,
		type FormErrors,
		type ZFormProps
	} from '../src/entrypoints/index.js';

	const throwingSchema: NonNullable<ZFormProps['schema']> = {
		'~standard': {
			version: 1,
			vendor: 'throwing',
			validate() {
				throw new Error('schema failed');
			}
		}
	};
	let errors = $state<FormErrors>({});
	let validationErrors = $state(0);
	let invalidSubmits = $state(0);
	let resets = $state(0);
	let preventedSubmits = $state(0);
</script>

<ZForm
	bind:errors
	schema={throwingSchema}
	validateOn={['change']}
	validationDelay={10}
	focusFirstError={false}
	nativeValidation
	onValidationError={() => (validationErrors += 1)}
	onInvalidSubmit={() => (invalidSubmits += 1)}
	onReset={() => (resets += 1)}
	data-testid="throwing-form"
>
	<ZFormField name="edge" label="Edge"><ZInput name="edge" data-testid="edge-input" /></ZFormField>
	<button type="submit">Submit throwing</button>
	<button type="reset">Reset throwing</button>
</ZForm>

<ZForm
	preventDefault={false}
	nativeValidation
	onSubmit={(event) => {
		preventedSubmits += 1;
		event.preventDefault();
	}}
	data-testid="prevented-form"
>
	<button type="submit">Submit prevented</button>
</ZForm>

<output data-testid="form-edge-output"
	>{Object.keys(errors).join(
		','
	)}:{validationErrors}:{invalidSubmits}:{resets}:{preventedSubmits}</output
>
