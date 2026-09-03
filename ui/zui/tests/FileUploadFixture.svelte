<script lang="ts">
	import {
		ZFileUpload,
		type FileRejection,
		type FileUploadItem
	} from '../src/entrypoints/index.js';

	let { disabled = false }: { disabled?: boolean } = $props();
	let files = $state<readonly FileUploadItem[]>([]);
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
		multiple
		name="asset"
		onReject={(next) => (rejected = next)}
		removeLabel={(item) => `Remove ${item.file.name}`}
	/>
	<button type="reset">Reset</button>
</form>
<output data-testid="file-upload-output"
	>{files.map((item) => item.file.name).join(',') || 'none'}:{rejected.length}</output
>
