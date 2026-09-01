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

	let files = $state<readonly FileUploadItem[]>();
	let version = 1;

	function replace(status: 'error' | 'queued' | 'success'): void {
		const file = new File([String(version)], `owner-${version}.json`, {
			type: 'application/json'
		});
		files = [
			createFileUploadItem(`owner-${version}`, file, {
				...(status === 'error' ? { error: 'Owner 写入的业务错误' } : {}),
				progress: status === 'success' ? 100 : status === 'error' ? 65 : 0,
				status
			})
		];
		version += 1;
	}

	onMount(() => replace('success'));
</script>

{#if files}
	<ZStack gap="medium">
		<ZFileUpload bind:files />
		<ZStack direction="row" gap="small">
			<ZButton onclick={() => replace('queued')} variant="secondary">替换为 Queued</ZButton>
			<ZButton onclick={() => replace('error')} variant="secondary">替换为 Error</ZButton>
			<ZButton onclick={() => replace('success')} variant="secondary">替换为 Success</ZButton>
			<ZButton onclick={() => (files = [])} variant="ghost">外部清空</ZButton>
		</ZStack>
		<ZText tone="muted">Owner 队列：{files.map((item) => item.id).join(', ') || '空'}</ZText>
	</ZStack>
{:else}
	<ZSpinner label="正在准备受控队列" />
{/if}
