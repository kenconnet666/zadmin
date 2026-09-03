<script lang="ts">
	import { ZInput, ZInputGroup } from '../src/entrypoints/index.js';

	let value = $state('api');
</script>

<form data-testid="input-group-form">
	<ZInputGroup aria-label="Endpoint">
		{#snippet prefix()}https://{/snippet}
		<ZInput aria-label="Host" bind:value defaultValue="api" name="host" />
		{#snippet suffix()}.internal{/snippet}
	</ZInputGroup>
	<ZInputGroup aria-label="Disabled endpoint" disabled invalid>
		<ZInput aria-label="Disabled host" />
	</ZInputGroup>
	<button type="reset">Reset</button>
</form>
<output data-testid="input-group-output">{value}</output>
