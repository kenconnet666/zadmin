<script lang="ts">
	import ZSwitch from '../src/components/input/ZSwitch.svelte';

	let checked = $state(false);
	let changes = $state(0);
</script>

<form data-testid="switch-form">
	<ZSwitch
		bind:checked
		data-testid="switch"
		name="alerts"
		onCheckedChange={() => (changes += 1)}
		value="enabled"
	/>
	<button type="reset">Reset</button>
</form>
<output data-testid="switch-output">{checked}:{changes}</output>
