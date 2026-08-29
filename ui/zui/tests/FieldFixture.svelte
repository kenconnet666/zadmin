<script lang="ts">
	import { ZField, ZInput } from '../src/entrypoints/index.js';

	interface Props {
		error?: string | readonly string[];
	}

	let { error = ['A value is required', 'Try again'] }: Props = $props();
	let value = $state<string>();
	let changes = $state(0);
</script>

<form data-testid="field-form">
	<p id="external-help">External help</p>
	<ZField label="Account" description="Use your work account" {error} required>
		<ZInput
			aria-describedby="external-help"
			data-testid="field-input"
			defaultValue="seed"
			bind:value
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
	<output data-testid="field-output">{value}:{changes}</output>
</form>
