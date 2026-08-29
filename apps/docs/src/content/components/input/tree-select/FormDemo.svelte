<script lang="ts">
	import { ZButton, ZStack, ZText, ZTreeSelect, type TreeNode } from '@zadmin/zui';
	const nodes: readonly TreeNode[] = [
		{ key: 'platform', label: '平台' },
		{ key: 'web', label: 'Web应用', parentKey: 'platform' },
		{ key: 'admin', label: '管理端', parentKey: 'web' },
		{ key: 'docs', label: '文档站', parentKey: 'web' },
		{ key: 'worker', label: '任务执行器', parentKey: 'platform' }
	];
	let value = $state<string | number>('docs');
</script>

<form>
	<ZStack gap="medium">
		<ZTreeSelect
			aria-label="选择项目节点"
			bind:value
			defaultExpandedKeys={['platform', 'web']}
			defaultValue="docs"
			name="node"
			{nodes}
		/>
		<ZButton type="reset" variant="secondary">重置</ZButton>
		<ZText tone="muted">value = {value}</ZText>
	</ZStack>
</form>
