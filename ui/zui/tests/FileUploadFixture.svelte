<script lang="ts">
	import { ZFileUpload, type FileRejection } from '../src/entrypoints/index.js';

	let { disabled = false }: { disabled?: boolean } = $props();
	let files = $state<readonly File[]>([]);
	let rejected = $state<readonly FileRejection<File>[]>([]);
</script>

<form data-testid="file-upload-form">
	<ZFileUpload
		accept="application/json,.yaml"
		bind:files
		{disabled}
		inputLabel="Assets"
		maxFiles={2}
		maxSize={8}
		name="asset"
		onReject={(next) => (rejected = next)}
		removeLabel={(file) => `Remove ${file.name}`}
	/>
	<button type="reset">Reset</button>
	<output data-testid="file-upload-output"
		>{files.map((file) => file.name).join(',') || 'none'}:{rejected.length}</output
	>
</form>
