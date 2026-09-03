<script lang="ts">
	import type { StandardSchemaV1 } from '@standard-schema/spec';

	import {
		ZForm,
		ZFormField,
		ZInput,
		type FormSubmitDetail,
		type ZFormController
	} from '../src/entrypoints/index.js';

	interface GraphInput {
		confirm: string;
		password: string;
		users: readonly { email: string }[];
	}

	interface GraphOutput extends GraphInput {
		canonicalEmail: string;
	}

	const schema: StandardSchemaV1<GraphInput, GraphOutput> = {
		'~standard': {
			version: 1,
			vendor: 'zui-form-graph-test',
			async validate(input) {
				const values = input as GraphInput;
				await Promise.resolve();
				const issues: { message: string; path: readonly (string | number)[] }[] = [];
				const email = String(values.users?.[0]?.email ?? '');
				if (!email.includes('@'))
					issues.push({ message: 'Email invalid', path: ['users', 0, 'email'] });
				if (String(values.confirm ?? '') !== String(values.password ?? '')) {
					issues.push({ message: 'Passwords differ', path: ['confirm'] });
				}
				return issues.length > 0
					? { issues }
					: {
							value: {
								...values,
								canonicalEmail: email.trim().toLowerCase()
							}
						};
			}
		}
	};
	let controller = $state<ZFormController<GraphOutput> | null>(null);
	let showConfirm = $state(true);
	let result = $state('none');
	let confirmState = $state('none');
	let emailObserved = $state('none');

	$effect(() => {
		const current = controller;
		if (!current) return;
		emailObserved = 'subscribed';
		return current.subscribeField(['users', 0, 'email'], (state) => {
			emailObserved = `${state.dirty ? 'dirty' : 'clean'}:${state.errors.length}`;
		});
	});
</script>

<ZForm
	bind:controller
	{schema}
	validateOn={['change', 'submit']}
	validationDelay={0}
	onValidSubmit={(detail: FormSubmitDetail<GraphOutput>) => (result = detail.data.canonicalEmail)}
	data-testid="form-graph"
>
	<ZFormField name={['users', 0, 'email']} label="Email">
		<ZInput data-testid="graph-email" />
	</ZFormField>
	<ZFormField name="password" label="Password">
		<ZInput data-testid="graph-password" type="password" />
	</ZFormField>
	{#if showConfirm}
		<ZFormField
			name="confirm"
			dependencies={['password']}
			label="Confirm"
			onStateChange={(state) =>
				(confirmState = `${state.dirty}:${state.validating}:${state.errors.join(',')}`)}
		>
			<ZInput data-testid="graph-confirm" type="password" />
		</ZFormField>
	{/if}
	<button type="submit">Submit graph</button>
	<button type="reset">Reset graph</button>
	<button
		type="button"
		data-testid="graph-server-error"
		onclick={() => {
			controller?.setErrors({ 'users[0].email': ['Already registered'] });
			controller?.focusField(['users', 0, 'email']);
		}}
		>Set server error
	</button>
	<button type="button" data-testid="graph-toggle" onclick={() => (showConfirm = !showConfirm)}
		>Toggle confirm
	</button>
	<button
		type="button"
		data-testid="graph-status"
		onclick={() => {
			controller?.setFieldState(['users', 0, 'email'], {
				success: 'Address available',
				warnings: ['Shared mailbox']
			});
		}}
		>Set status
	</button>
</ZForm>
<output data-testid="graph-output">{result}|{confirmState}</output>
<output data-testid="graph-email-observed">{emailObserved}</output>
