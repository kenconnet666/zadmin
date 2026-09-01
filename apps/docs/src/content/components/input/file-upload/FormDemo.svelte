<script lang="ts">
	import {
		ZButton,
		ZField,
		ZFileUpload,
		ZStack,
		ZText,
		type FileRejection,
		type FileUploadItem
	} from '@zadmin/zui';

	let files = $state<readonly FileUploadItem[]>([]);
	let rejected = $state<readonly FileRejection<File>[]>([]);
	let submitted = $state('尚未读取 FormData');

	function resetRejections(event: Event): void {
		queueMicrotask(() => {
			if (!event.defaultPrevented) rejected = [];
		});
	}

	function inspectFormData(event: SubmitEvent): void {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		submitted =
			(new FormData(form).getAll('config') as File[]).map((file) => file.name).join(', ') || '空';
	}
</script>

<form onreset={resetRejections} onsubmit={inspectFormData}>
	<ZStack gap="medium">
		<ZField
			description="File 通过原生 formdata 边界以重复同名 entry 提交；reset 恢复 defaultFiles。"
			label="发布配置"
			name="config"
			required
		>
			<ZFileUpload
				accept="application/json,.yaml,.yml"
				bind:files
				chooseLabel="选择配置文件"
				dropLabel="拖放 JSON 或 YAML 配置，或打开系统选择器"
				inputLabel="选择配置文件"
				maxFiles={3}
				maxSize={1024 * 1024}
				multiple
				onReject={(next) => (rejected = next)}
				removeLabel={(item) => `移除 ${item.file.name}`}
			/>
		</ZField>
		<ZStack direction="row" gap="small">
			<ZButton type="submit">读取 FormData</ZButton>
			<ZButton type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted"
			>queue = {files.map((item) => `${item.file.name}:${item.status}`).join(',') || 'none'} · rejected
			= {rejected.length} · FormData = {submitted}</ZText
		>
	</ZStack>
</form>
