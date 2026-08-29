<script lang="ts">
	import { ZButton, ZStack, ZText, ZTree, type TreeNode } from '@zadmin/zui';
	const nodes: readonly TreeNode[] = [
		{ key: 'platform', label: '平台' },
		{ key: 'web', label: 'Web应用', parentKey: 'platform' },
		{ key: 'admin', label: '管理端', parentKey: 'web' },
		{ key: 'docs', label: '文档站', parentKey: 'web' },
		{ key: 'worker', label: '任务执行器', parentKey: 'platform' },
		{ disabled: true, key: 'legacy', label: '旧版服务（只读）', parentKey: 'platform' }
	];
	let expandedKeys = $state<readonly (string | number)[]>(['platform', 'web']);
	let selectedKeys = $state<readonly (string | number)[]>(['docs']);
</script>

<form>
	<ZStack gap="medium">
		<ZTree
			aria-label="项目结构"
			bind:expandedKeys
			bind:selectedKeys
			defaultExpandedKeys={['platform', 'web']}
			defaultSelectedKeys={['docs']}
			name="node"
			{nodes}
		/>
		<ZButton type="reset" variant="secondary">重置</ZButton>
		<ZText tone="muted"
			>expanded = {expandedKeys.join(',')} · selected = {selectedKeys.join(',')}</ZText
		>
	</ZStack>
</form>
