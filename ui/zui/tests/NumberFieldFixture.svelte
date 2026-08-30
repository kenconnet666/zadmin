<script lang="ts">
	import { ZNumberField } from '../src/entrypoints/index.js';

	let value = $state<number>(1.5);
</script>

<form data-testid="number-field-form">
	<ZNumberField
		bind:value
		defaultValue={1.5}
		decrementLabel="Decrease"
		incrementLabel="Increase"
		inputLabel="Amount"
		locale="de-DE"
		max={3}
		min={0}
		name="amount"
		step={0.25}
	/>
	<button type="reset">Reset</button>
	<output data-testid="number-field-output">{value ?? 'empty'}</output>
</form>
