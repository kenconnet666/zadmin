<script lang="ts">
	import { ZButton, ZFileUpload, ZStack, ZText, type FileRejection } from '@zadmin/zui';

	let files = $state<readonly File[]>([]);
	let rejected = $state<readonly FileRejection<File>[]>([]);
</script>

<form>
	<ZStack gap="medium">
		<ZFileUpload
			accept="application/json,.yaml,.yml"
			bind:files
			chooseLabel="选择配置文件"
			dropLabel="拖放JSON或YAML配置，或打开系统选择器"
			inputLabel="选择配置文件"
			maxFiles={3}
			maxSize={1024 * 1024}
			name="config"
			onReject={(next) => (rejected = next)}
			removeLabel={(file) => `移除 ${file.name}`}
		/>
		<ZButton type="reset" variant="secondary">重置</ZButton>
		<ZText tone="muted"
			>files = {files.map((file) => file.name).join(',') || 'none'} · rejected = {rejected.length}</ZText
		>
	</ZStack>
</form>
