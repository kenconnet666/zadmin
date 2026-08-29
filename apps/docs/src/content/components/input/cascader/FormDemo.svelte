<script lang="ts">
	import { ZButton, ZCascader, ZStack, ZText, type TreeNode } from '@zadmin/zui';
	const nodes: readonly TreeNode[] = [
		{ key: 'platform', label: '平台' },
		{ key: 'web', label: 'Web应用', parentKey: 'platform' },
		{ key: 'admin', label: '管理端', parentKey: 'web' },
		{ key: 'docs', label: '文档站', parentKey: 'web' },
		{ key: 'worker', label: '任务执行器', parentKey: 'platform' }
	];
	let value = $state<readonly (string | number)[]>(['platform', 'web', 'docs']);
</script>

<form>
	<ZStack gap="medium">
		<ZCascader bind:value defaultValue={['platform', 'web', 'docs']} name="path" {nodes} />
		<ZButton type="reset" variant="secondary">重置</ZButton>
		<ZText tone="muted">path = {value.join('/')}</ZText>
	</ZStack>
</form>
