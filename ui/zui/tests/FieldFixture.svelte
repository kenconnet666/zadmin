<script lang="ts">
	import { ZField, ZInput } from '../src/lib/index.js';

	interface Props {
		error?: string;
	}

	let { error = 'A value is required' }: Props = $props();
	let value = $state('');
	let changes = $state(0);
</script>

<form data-testid="field-form">
	<ZField label="Account" description="Use your work account" {error} required>
		<ZInput
			data-testid="field-input"
			bind:value
			onValueChange={() => {
				changes += 1;
			}}
		/>
	</ZField>
	<ZField label="Optional account">
		<ZInput data-testid="optional-input" />
	</ZField>
	<button type="reset">Reset</button>
	<output data-testid="field-output">{value}:{changes}</output>
</form>
