<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ZField,
		ZFileUpload,
		ZSpinner,
		ZStack,
		createFileUploadItem,
		type FileUploadItem
	} from '@zadmin/zui';

	let readonlyFiles = $state<readonly FileUploadItem[]>();
	onMount(() => {
		readonlyFiles = [
			createFileUploadItem(
				'policy',
				new File(['locked'], 'signed-policy.json', { type: 'application/json' }),
				{ progress: 100, status: 'success' }
			)
		];
	});
</script>

<ZStack gap="large">
	<ZField error="签名文件已过期，请重新选择。" label="无效且必填" required>
		<ZFileUpload
			accept="application/json"
			chooseLabel="选择签名文件"
			dropLabel="拖放一份 JSON 签名文件"
			inputLabel="选择签名文件"
		/>
	</ZField>
	{#if readonlyFiles}
		<ZField
			description="仍可聚焦、读取和进入 FormData，但所有写命令都被阻止。"
			label="只读审计附件"
			name="audit"
			readonly
		>
			<ZFileUpload defaultFiles={readonlyFiles} />
		</ZField>
	{:else}
		<ZSpinner label="正在准备只读队列" />
	{/if}
	<ZField disabled label="禁用上传">
		<ZFileUpload chooseLabel="上传已锁定" dropLabel="当前环境禁止上传" />
	</ZField>
</ZStack>
