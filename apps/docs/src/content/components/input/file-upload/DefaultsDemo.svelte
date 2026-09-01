<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ZButton,
		ZFileUpload,
		ZSpinner,
		ZStack,
		ZText,
		createFileUploadItem,
		type FileUploadItem
	} from '@zadmin/zui';

	let defaultFiles = $state<readonly FileUploadItem[]>();
	let files = $state<readonly FileUploadItem[]>();
	onMount(() => {
		defaultFiles = [
			createFileUploadItem(
				'baseline',
				new File(['{"environment":"production"}'], 'baseline.json', {
					type: 'application/json'
				}),
				{ progress: 100, status: 'success' }
			),
			createFileUploadItem(
				'failed-notes',
				new File(['retry'], 'release-notes.json', { type: 'application/json' }),
				{ error: '演示失败状态', progress: 36, status: 'error' }
			)
		];
	});
</script>

{#if defaultFiles}
	<form>
		<ZStack gap="medium">
			<ZFileUpload
				accept="application/json"
				bind:files
				chooseLabel="替换基线文件"
				data-testid="file-upload-defaults"
				{defaultFiles}
				dropLabel="拖放新的JSON，或保留初始队列"
				inputLabel="替换基线文件"
				multiple
				name="baseline"
			/>
			<ZButton type="reset" variant="secondary">恢复初始队列</ZButton>
			<ZText tone="muted"
				>files = {(files ?? defaultFiles)
					.map((item) => `${item.file.name}:${item.status}`)
					.join(',') || 'none'}</ZText
			>
		</ZStack>
	</form>
{:else}
	<ZSpinner label="正在准备初始文件" />
{/if}
