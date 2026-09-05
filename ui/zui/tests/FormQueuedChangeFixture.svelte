<script lang="ts">
	import {
		ZForm,
		ZFormField,
		ZInput,
		type FormErrors,
		type ZFormController,
		type ZFormProps
	} from '../src/entrypoints/index.js';

	const schema: NonNullable<ZFormProps['schema']> = {
		'~standard': {
			version: 1,
			vendor: 'zui-queued-change-test',
			validate(input) {
				return { value: input };
			}
		}
	};
	let errors = $state<FormErrors>({});
	let result = $state('none');
	let manualResult = $state('none');
	let controller = $state<ZFormController | null>(null);
</script>

<ZForm
	bind:controller
	bind:errors
	{schema}
	validateOn={['change', 'submit']}
	validationDelay={0}
	onValidSubmit={() => (result = 'valid')}
	data-testid="queued-change-form"
>
	<ZFormField name="account" label="Account">
		<ZInput data-testid="queued-change-input" />
	</ZFormField>
	<button type="submit">Submit</button>
</ZForm>
<output data-testid="queued-change-output">{Object.keys(errors).length}:{result}</output>
<button
	type="button"
	data-testid="queued-change-validate"
	onclick={() => {
		void controller?.validate().then((result) => {
			manualResult = result.outdated ? 'outdated' : result.valid ? 'valid' : 'invalid';
		});
	}}>Validate</button
>
<output data-testid="queued-change-manual-output">{manualResult}</output>
