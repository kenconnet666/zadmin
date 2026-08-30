<script lang="ts">
	import { ZField, ZInput } from '../src/entrypoints/index.js';

	interface Props {
		error?: string | readonly string[];
	}

	let { error = ['A value is required', 'Try again'] }: Props = $props();
	let value = $state<string>();
	let changes = $state(0);
	let resets = $state(0);
	let externalValue = $state('external-seed');
	let externalFormId = $state('external-input-form');
	let delegatedValue = $state('delegated-seed');
	let delegatedResets = $state(0);
</script>

<form data-testid="field-form">
	<p id="external-help">External help</p>
	<ZField label="Account" description="Use your work account" {error} required>
		<ZInput
			aria-describedby="external-help"
			data-testid="field-input"
			defaultValue="seed"
			bind:value
			onFormReset={() => {
				resets += 1;
			}}
			onValueChange={() => {
				changes += 1;
			}}
		/>
	</ZField>
	<ZField label="Optional account">
		<ZInput data-testid="optional-input" />
	</ZField>
	<ZField label="Inherited state" disabled name="inherited" readonly>
		<ZInput data-testid="inherited-input" />
	</ZField>
	<button type="reset">Reset</button>
	<output data-testid="field-output">{value}:{changes}:{resets}</output>
</form>

<form id="external-input-form" data-testid="external-input-form">
	<button type="reset">Reset external input</button>
</form>
<form id="external-input-next-form" data-testid="external-input-next-form">
	<button type="reset">Reset reassigned input</button>
</form>
<button
	type="button"
	data-testid="external-input-reassign"
	onclick={() => (externalFormId = 'external-input-next-form')}>Reassign external input</button
>
<ZInput
	bind:value={externalValue}
	data-testid="external-input"
	defaultValue="external-seed"
	form={externalFormId}
	name="external"
/>
<output data-testid="external-input-output">{externalValue}</output>

<form data-testid="delegated-input-form">
	<ZInput
		bind:value={delegatedValue}
		data-testid="delegated-input"
		defaultValue="delegated-seed"
		resetOnForm={false}
		onFormReset={() => {
			delegatedResets += 1;
			delegatedValue = 'delegated-seed';
		}}
	/>
	<button type="reset">Reset delegated input</button>
</form>
<output data-testid="delegated-input-output">{delegatedValue}:{delegatedResets}</output>
