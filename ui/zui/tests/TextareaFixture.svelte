<script lang="ts">
	import { ZField, ZTextarea } from '../src/entrypoints/index.js';

	let value = $state('Seed');
	let resized = $state(0);
</script>

<form data-testid="textarea-form">
	<ZField label="Description" description="Deployment details" required>
		<ZTextarea
			autosize
			bind:value
			defaultValue="Seed"
			name="description"
			onResize={() => (resized += 1)}
			rows={2}
		/>
	</ZField>
	<button type="reset">Reset</button>
</form>
<output data-testid="textarea-output">{value}:{resized}</output>
