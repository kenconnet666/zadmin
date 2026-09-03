<script lang="ts">
	import {
		ZForm,
		ZFormField,
		ZInput,
		type FormErrors,
		type FormSubmitDetail,
		type ZFormProps
	} from '../src/entrypoints/index.js';

	const schema: NonNullable<ZFormProps['schema']> = {
		'~standard': {
			version: 1,
			vendor: 'zui-test',
			async validate(input) {
				const values = input as Record<string, FormDataEntryValue>;
				const account = String(values.account ?? '');
				await new Promise((resolve) => setTimeout(resolve, account === 'x' ? 40 : 0));
				const issues: { message: string; path: string[] }[] = [];
				if (account.length < 3) issues.push({ message: 'Account too short', path: ['account'] });
				if (!String(values.email ?? '').includes('@'))
					issues.push({ message: 'Email invalid', path: ['email'] });
				return issues.length > 0 ? { issues } : { value: values };
			}
		}
	};
	let { preventFieldEvents = false }: { preventFieldEvents?: boolean } = $props();
	let account = $state('');
	let email = $state('');
	let errors = $state<FormErrors>({});
	let validating = $state(false);
	let submitted = $state(false);
	let result = $state('none');
</script>

<ZForm
	bind:errors
	bind:submitted
	bind:validating
	data-testid="z-form"
	onValidSubmit={(detail: FormSubmitDetail) =>
		(result = String((detail.data as Record<string, string>).account))}
	{schema}
	validateOn={['change', 'blur', 'submit']}
	validationDelay={0}
>
	<ZFormField
		name="account"
		label="Account"
		required
		oninput={(event) => preventFieldEvents && event.preventDefault()}
		onfocusout={(event) => preventFieldEvents && event.preventDefault()}
	>
		<ZInput autocomplete="username" bind:value={account} data-testid="form-account" />
	</ZFormField>
	<ZFormField name="email" label="Email" required>
		<ZInput autocomplete="email" bind:value={email} data-testid="form-email" />
	</ZFormField>
	<button type="submit">Submit</button>
	<button type="reset">Reset</button>
</ZForm>
<output data-testid="form-output"
	>{submitted}:{validating}:{Object.keys(errors).length}:{result}</output
>
