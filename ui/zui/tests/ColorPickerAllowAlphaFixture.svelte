<script lang="ts">
	import { ZColorPicker } from '../src/entrypoints/index.js';

	let opaque = $state<string | null>('#336699');
	let alpha = $state<string | null>('#33669980');
</script>

<form data-testid="color-alpha-form">
	<ZColorPicker
		allowAlpha={false}
		bind:value={opaque}
		defaultValue="#33669980"
		data-testid="color-opaque"
		name="opaque"
	/>
	<ZColorPicker
		allowAlpha
		bind:value={alpha}
		defaultValue="#33669980"
		data-testid="color-alpha"
		name="alpha"
	/>
	<button type="reset">Reset</button>
</form>
<output data-testid="color-alpha-output">{opaque}:{alpha}</output>
