<script lang="ts">
	import { ZPinInput } from '../src/entrypoints/index.js';

	let value = $state('12');
	let completed = $state(0);
</script>

<form data-testid="pin-input-form">
	<ZPinInput
		bind:value
		defaultValue="12"
		inputLabel={(index, length) => `PIN ${index + 1} of ${length}`}
		length={4}
		name="pin"
		onComplete={() => (completed += 1)}
	/>
	<button type="reset">Reset</button>
	<output data-testid="pin-input-output">{value}:{completed}</output>
</form>
