<script lang="ts">
	import { ZButton, ZProvider, ZSlider, type ZuiDirection } from '../src/entrypoints/index.js';

	let direction = $state<ZuiDirection>('ltr');
	let value = $state(50);
	let changes = $state(0);
	let keydowns = $state(0);
</script>

<ZProvider {direction}>
	<ZSlider
		bind:value
		aria-label="Keyboard threshold"
		max={100}
		min={0}
		onValueChange={() => (changes += 1)}
		onkeydown={() => (keydowns += 1)}
		step={5}
		data-testid="slider-keyboard"
	/>
	<ZButton
		type="button"
		data-testid="slider-toggle-direction"
		onclick={() => (direction = direction === 'ltr' ? 'rtl' : 'ltr')}
	>
		Toggle direction
	</ZButton>
</ZProvider>
<output data-testid="slider-keyboard-output">{direction}:{value}:{changes}:{keydowns}</output>
