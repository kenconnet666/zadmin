<script lang="ts">
	import { onMount } from 'svelte';
	import { ZButton, ZFileUpload, ZSpinner, ZStack, ZText } from '@zadmin/zui';

	let defaultFiles = $state<readonly File[]>();
	let files = $state<readonly File[]>();
	onMount(() => {
		defaultFiles = [
			new File(['{"environment":"production"}'], 'baseline.json', {
				type: 'application/json'
			})
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
				name="baseline"
			/>
			<ZButton type="reset" variant="secondary">恢复初始队列</ZButton>
			<ZText tone="muted"
				>files = {(files ?? defaultFiles).map((file) => file.name).join(',') || 'none'}</ZText
			>
		</ZStack>
	</form>
{:else}
	<ZSpinner label="正在准备初始文件" />
{/if}
