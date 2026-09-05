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
	let preserved = $state('seed');
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
	onreset={() => (resets += 1)}
	data-testid="throwing-form"
>
	<ZFormField name="edge" label="Edge"><ZInput name="edge" data-testid="edge-input" /></ZFormField>
	<button type="submit">Submit throwing</button>
	<button type="reset">Reset throwing</button>
</ZForm>

<ZForm
	data-testid="prevented-reset-form"
	nativeValidation
	onreset={(event) => event.preventDefault()}
>
	<ZInput bind:value={preserved} defaultValue="seed" name="preserved" />
</ZForm>
<output data-testid="prevented-reset-output">{preserved}</output>

<form data-testid="wrapped-label-form">
	<label data-testid="wrapped-label">Wrapped <ZInput data-testid="wrapped-input" /></label>
</form>

<ZForm
	aria-busy="true"
	preventDefault={false}
	nativeValidation
	onsubmit={(event) => {
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
