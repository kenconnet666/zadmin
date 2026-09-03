<script lang="ts">
	import { ZColorPicker } from '../src/entrypoints/index.js';

	let { defaultOpen = false }: { defaultOpen?: boolean } = $props();
	let value = $state('#33669980');
</script>

<form data-testid="color-picker-form">
	<ZColorPicker
		allowAlpha
		bind:value
		{defaultOpen}
		defaultValue="#33669980"
		name="color"
		triggerLabel={(current) => `Color ${current}`}
	/>
	<button type="reset">Reset</button>
</form>
<output data-testid="color-picker-output">{value}</output>
