<script lang="ts">
	import type { StandardSchemaV1 } from '@standard-schema/spec';
	import {
		ZForm,
		ZFormField,
		ZInput,
		type FormErrors,
		type ZFormProps
	} from '../src/entrypoints/index.js';

	type Resolver = (result: StandardSchemaV1.Result<{ account: string }>) => void;
	let account = $state('');
	let errors = $state<FormErrors>({});
	let submitted = $state(false);
	let validating = $state(false);
	let validSubmits = $state(0);
	let validationCalls = $state(0);
	const resolvers: Resolver[] = [];
	const schema: NonNullable<ZFormProps['schema']> = {
		'~standard': {
			version: 1,
			vendor: 'zui-submit-epoch-test',
			validate() {
				validationCalls += 1;
				return new Promise((resolve) => resolvers.push(resolve));
			}
		}
	};
	function resolveOldValidation(): void {
		resolvers[0]?.({ issues: [{ message: 'Stale change error', path: ['account'] }] });
	}
	function resolveSubmitValidation(): void {
		resolvers[1]?.({ value: { account } });
	}
	function onValid(): void {
		validSubmits += 1;
	}
</script>

<ZForm
	bind:errors
	bind:submitted
	bind:validating
	{schema}
	validateOn={['change', 'blur', 'submit']}
	validationDelay={0}
	onValidSubmit={onValid}
	data-testid="submit-epoch-form"
>
	<ZFormField name="account" label="Account"
		><ZInput bind:value={account} data-testid="submit-epoch-input" /></ZFormField
	>
	<button type="submit">Submit</button>
	<button type="button" data-testid="resolve-old" onclick={resolveOldValidation}>Resolve old</button
	>
	<button type="button" data-testid="resolve-submit" onclick={resolveSubmitValidation}
		>Resolve submit</button
	>
	<output data-testid="submit-epoch-output"
		>{validationCalls}:{submitted}:{validating}:{Object.keys(errors).length}:{validSubmits}</output
	>
</ZForm>
