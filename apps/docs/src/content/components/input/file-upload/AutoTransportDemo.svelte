<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ZButton,
		ZFileUpload,
		ZSpinner,
		ZStack,
		ZText,
		createFileUploadItem,
		type FileUploadItem,
		type FileUploadTransportContext
	} from '@zadmin/zui';

	let generation = $state(1);
	let files = $state<readonly FileUploadItem[]>();
	let ready = $state(false);

	function replaceQueue(): void {
		files = [
			createFileUploadItem(
				`automatic-${generation}`,
				new File([`{"generation":${generation}}`], `automatic-${generation}.json`, {
					type: 'application/json'
				})
			)
		];
		generation += 1;
	}

	onMount(() => {
		replaceQueue();
		ready = true;
	});

	function transport({ reportProgress, signal }: FileUploadTransportContext): Promise<void> {
		return new Promise((resolve, reject) => {
			let progress = 0;
			const view = document.defaultView!;
			const timer = view.setInterval(() => {
				progress += 25;
				reportProgress(progress);
				if (progress < 100) return;
				cleanup();
				resolve();
			}, 140);
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

{#if ready}
	<ZStack gap="medium">
		<ZFileUpload autoUpload bind:files {transport} />
		<ZButton onclick={replaceQueue} variant="secondary">外部换入新的 queued 文件</ZButton>
		<ZText tone="muted">
			autoUpload 仅决定何时调用 adapter；URL、凭据、缓存和响应仍不属于组件。当前：
			{files?.map((item) => `${item.file.name}:${item.status}`).join(', ') || '空'}
		</ZText>
	</ZStack>
{:else}
	<ZSpinner label="正在准备自动上传队列" />
{/if}
