<script lang="ts">
	import ZRadioGroup from '../src/components/compound/radio-group/ZRadioGroup.svelte';
	import ZRadioGroupItem from '../src/components/compound/radio-group/ZRadioGroupItem.svelte';

	let value = $state('b');
	let changes = $state(0);
</script>

<form data-testid="radio-form">
	<ZRadioGroup
		bind:value
		aria-label="Choice"
		defaultValue="b"
		name="choice"
		onValueChange={() => (changes += 1)}
		orientation="horizontal"
	>
		<label><ZRadioGroupItem data-testid="radio-a" value="a" /> Alpha</label>
		<label><ZRadioGroupItem data-testid="radio-b" value="b" /> Beta</label>
		<label><ZRadioGroupItem data-testid="radio-c" disabled value="c" /> Disabled</label>
		<label><ZRadioGroupItem data-testid="radio-d" value="d" /> Delta</label>
	</ZRadioGroup>
	<button type="reset">Reset</button>
	<output data-testid="radio-output">{value}:{changes}</output>
</form>
