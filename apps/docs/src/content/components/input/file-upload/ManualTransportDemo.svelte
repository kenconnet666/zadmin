<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import {
		ZFileUpload,
		ZSpinner,
		ZStack,
		ZText,
		createFileUploadItem,
		type FileUploadItem,
		type FileUploadTransportContext
	} from '@zadmin/zui';

	let defaultFiles = $state<readonly FileUploadItem[]>();
	let files = $state<readonly FileUploadItem[]>();
	const attempts = new SvelteMap<string, number>();

	onMount(() => {
		defaultFiles = [
			createFileUploadItem(
				'manual-release',
				new File(['{"version":"2.0"}'], 'release.json', { type: 'application/json' })
			)
		];
	});

	function transport({ item, reportProgress, signal }: FileUploadTransportContext): Promise<void> {
		const attempt = (attempts.get(item.id) ?? 0) + 1;
		attempts.set(item.id, attempt);
		return new Promise((resolve, reject) => {
			let progress = 0;
			const view = document.defaultView!;
			const timer = view.setInterval(() => {
				progress += 20;
				reportProgress(progress);
				if (progress < 100) return;
				cleanup();
				if (attempt === 1) reject(new Error('demo first attempt'));
				else resolve();
			}, 180);
			const abort = () => {
				cleanup();
				reject(new DOMException('Upload aborted', 'AbortError'));
			};
			const cleanup = () => {
				view.clearInterval(timer);
				signal.removeEventListener('abort', abort);
			};
			signal.addEventListener('abort', abort, { once: true });
		});
	}
</script>

{#if defaultFiles}
	<ZStack gap="medium">
		<ZFileUpload
			bind:files
			{defaultFiles}
			errorMessage={(_error, item) => `${item.file.name} 首次演示失败，请点击重试`}
			{transport}
		/>
		<ZText tone="muted">
			默认手动：点击上传图标；上传中可中止，失败后可重试。状态 =
			{(files ?? defaultFiles).map((item) => `${item.status}:${item.progress}%`).join(', ')}
		</ZText>
	</ZStack>
{:else}
	<ZSpinner label="正在准备手动上传队列" />
{/if}
