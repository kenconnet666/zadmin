<script lang="ts">
	import ZToggleButton from '../src/components/gene/ZToggleButton.svelte';

	let pressed = $state(false);
	let changes = $state(0);
</script>

<ZToggleButton bind:pressed data-testid="toggle" onPressedChange={() => (changes += 1)}
	>Toggle</ZToggleButton
>
<ZToggleButton data-testid="cancelled-toggle" onclick={(event) => event.preventDefault()}
	>Cancelled</ZToggleButton
>
<output data-testid="toggle-output">{pressed}:{changes}</output>
