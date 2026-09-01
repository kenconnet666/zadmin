<script lang="ts">
	import { ZCascader, ZStack, ZText, type SelectionKey, type TreeNode } from '@zadmin/zui';

	const nodes: readonly TreeNode[] = [
		{ key: 'platform', label: '平台' },
		{ key: 'web', label: 'Web', parentKey: 'platform' },
		{ key: 'admin', label: '管理端', parentKey: 'web', textValue: 'admin console' },
		{ key: 'docs', label: '文档站', parentKey: 'web', textValue: 'documentation' },
		{ key: 'native', label: 'Native', parentKey: 'platform' },
		{ key: 'desktop', label: '桌面端', parentKey: 'native', textValue: 'desktop' },
		{ key: 'mobile', label: '移动端', parentKey: 'native', textValue: 'mobile' },
		{ disabled: true, key: 'retired', label: '已下线环境', parentKey: 'platform' }
	];
	let value = $state<readonly SelectionKey[]>([]);
</script>

<ZStack gap="medium">
	<ZCascader
		bind:value
		filter={(path, query) =>
			path.some((node) =>
				`${node.label} ${node.textValue ?? ''}`
					.toLocaleLowerCase()
					.includes(query.toLocaleLowerCase())
			)}
		{nodes}
		searchable
		searchPlaceholder="筛选已加载路径"
	/>
	<ZText tone="muted">loaded search path = {value.join('/') || 'empty'}</ZText>
</ZStack>
