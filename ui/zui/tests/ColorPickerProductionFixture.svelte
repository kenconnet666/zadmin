<script lang="ts">
	import { ZButton, ZColorPicker, ZField } from '../src/entrypoints/index.js';

	let value = $state<string | null>('#2563ebcc');
	let changes = $state(0);
</script>

<form id="color-production-form" data-testid="color-production-form">
	<ZButton type="reset">Reset</ZButton>
</form>
<ZField error="Brand color must meet contrast policy." label="Brand color" name="brand" required>
	<ZColorPicker
		allowAlpha
		bind:value
		clearable
		data-testid="color-production"
		defaultValue="#2563ebcc"
		form="color-production-form"
		onValueChange={() => (changes += 1)}
		presets={[
			{ label: 'Success preset', value: '#16a34a' },
			{ label: 'Warning preset', value: '#d9770680' }
		]}
	/>
</ZField>
<ZColorPicker
	data-testid="color-production-custom-label"
	readonly
	triggerLabel={(current) => `Preview ${current}`}
	value="#0f766e"
/>
<ZButton data-testid="color-owner-clear" onclick={() => (value = null)}>Owner clear</ZButton>
<output data-testid="color-production-output">{value ?? 'null'}:{changes}</output>
