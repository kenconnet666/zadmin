<script lang="ts">
	import { controlSizes, ZStack, ZText, ZTree } from '@zadmin/zui';
	const nodes = [
		{ key: 'project', label: '项目', hasChildren: true },
		{ key: 'source', parentKey: 'project', label: 'src' },
		{ key: 'config', parentKey: 'project', label: '配置文件' }
	];
</script>

<ZStack gap="large">
	{#each controlSizes as size (size)}
		<ZStack gap="small"
			><ZText size="small">{size}</ZText><ZTree
				{size}
				{nodes}
				defaultExpandedKeys={['project']}
				aria-label={size + ' 普通树'}
			/><ZTree
				{size}
				{nodes}
				defaultExpandedKeys={['project']}
				virtualized
				height={112}
				aria-label={size + ' 虚拟树'}
			/></ZStack
		>
	{/each}
</ZStack>
