<script lang="ts">
	import ZSlider from '../src/components/input/ZSlider.svelte';

	let value = $state(35);
	let changes = $state(0);
</script>

<form data-testid="slider-form">
	<ZSlider
		bind:value
		aria-label="Threshold"
		data-testid="slider"
		defaultValue={35}
		name="threshold"
		onValueChange={() => (changes += 1)}
		step={5}
	/>
	<button type="reset">Reset</button>
</form>
<output data-testid="slider-output">{value}:{changes}</output>
