<script lang="ts">
	import ZCheckbox, { type CheckboxState } from '../src/components/input/ZCheckbox.svelte';

	let checked = $state<CheckboxState>('indeterminate');
	let changes = $state(0);
</script>

<form data-testid="checkbox-form">
	<ZCheckbox
		bind:checked
		data-testid="checkbox"
		defaultChecked="indeterminate"
		name="choice"
		onCheckedChange={() => (changes += 1)}
		value="selected"
	/>
	<button type="reset">Reset</button>
</form>
<output data-testid="checkbox-output">{checked}:{changes}</output>
