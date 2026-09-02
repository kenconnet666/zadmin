<script lang="ts">
	import {
		ZFileUpload,
		type FileRejection,
		type FileUploadItem,
		type FileUploadTransport,
		type ZFileUploadController
	} from '../src/entrypoints/index.js';

	let {
		autoUpload = false,
		defaultFiles = [],
		disabled = false,
		invalid = false,
		readonly = false,
		replacementFiles,
		transport
	}: {
		autoUpload?: boolean;
		defaultFiles?: readonly FileUploadItem[];
		disabled?: boolean;
		invalid?: boolean;
		readonly?: boolean;
		replacementFiles?: readonly FileUploadItem[];
		transport?: FileUploadTransport;
	} = $props();

	let files = $state<readonly FileUploadItem[]>();
	let controller = $state<ZFileUploadController | null>(null);
	let rejected = $state<readonly FileRejection<File>[]>([]);
</script>

<ZFileUpload
	accept="application/json,.yaml,.yml"
	{autoUpload}
	bind:controller
	{defaultFiles}
	{disabled}
	bind:files
	form="file-upload-production-form"
	inputLabel="Choose production assets"
	{invalid}
	maxFiles={2}
	maxSize={8}
	multiple
	name="asset"
	onReject={(next) => (rejected = next)}
	{readonly}
	required
	{transport}
	data-testid="file-upload-production"
/>

<form id="file-upload-production-form" data-testid="file-upload-production-form">
	<button type="button" data-testid="upload-all" onclick={() => void controller?.upload()}>
		Upload all
	</button>
	<button type="button" data-testid="clear-files" onclick={() => controller?.clear()}>Clear</button>
	<button type="button" data-testid="external-clear" onclick={() => (files = [])}>
		External clear
	</button>
	{#if replacementFiles}
		<button type="button" data-testid="external-replace" onclick={() => (files = replacementFiles)}>
			External replace
		</button>
	{/if}
	<button type="reset">Reset</button>
	<output data-testid="file-upload-production-output">
		{(files ?? defaultFiles)
			.map((item) =>
				[item.id, item.file.name, item.status, item.progress, item.error ?? 'none'].join(':')
			)
			.join('|') || 'empty'}::{rejected.map((item) => item.reason).join(',') || 'accepted'}
	</output>
</form>
