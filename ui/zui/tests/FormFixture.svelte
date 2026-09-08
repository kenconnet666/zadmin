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
				if (account === 'x') {
					slowValidationStarted += 1;
					await new Promise<void>((resolve) => (resolveSlowValidation = resolve));
					slowValidationCompleted += 1;
				}
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
	let slowValidationStarted = $state(0);
	let slowValidationCompleted = $state(0);
	let resolveSlowValidation: (() => void) | undefined;

	function readErrors(): FormErrors {
		return errors;
	}

	// A bind owner may reflect an immutable publication through a fresh proxy/object identity.
	function reflectErrors(next: FormErrors): void {
		errors = Object.freeze(
			Object.fromEntries(
				Object.entries(next).map(([path, messages]) => [path, Object.freeze([...messages])])
			)
		);
	}

	function releaseSlowValidation(): void {
		resolveSlowValidation?.();
		resolveSlowValidation = undefined;
	}
</script>

<ZForm
	bind:errors={readErrors, reflectErrors}
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
	<button type="button" data-testid="form-resolve-slow-validation" onclick={releaseSlowValidation}
		>Resolve slow validation</button
	>
	<button type="reset">Reset</button>
</ZForm>
<output data-testid="form-output"
	>{submitted}:{validating}:{Object.keys(errors).length}:{result}</output
>
<output data-testid="form-slow-validation">{slowValidationStarted}:{slowValidationCompleted}</output
>
