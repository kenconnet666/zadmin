<script lang="ts">
	import { ZSegmented } from '../src/entrypoints/index.js';
	let value = $state<string | number>('b');
	let changes = $state(0);
	const options = [
		{ label: 'Alpha', value: 'a' },
		{ label: 'Beta', value: 'b' },
		{ disabled: true, label: 'Charlie', value: 'c' },
		{ label: 'Delta', value: 'd' }
	] as const;
</script>

<form data-testid="segmented-form">
	<ZSegmented
		aria-label="Periods"
		bind:value
		defaultValue="b"
		{options}
		name="period"
		onValueChange={() => (changes += 1)}
	/>
	<button type="reset">Reset</button>
	<output data-testid="segmented-output">{value}:{changes}</output>
</form>
