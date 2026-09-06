<script lang="ts">
	import { controlSizes, ZStack, ZText, ZCommand } from '@zadmin/zui';
	const items = [
		{ key: 'open', label: '打开项目', shortcut: '⌘O' },
		{
			key: 'deploy',
			label: '部署预览',
			description: '命令标题、说明与快捷键在窄容器中保留可读性。'
		}
	];
</script>

<ZStack gap="large">
	{#each controlSizes as size (size)}
		<ZStack gap="small"
			><ZText size="small">{size}</ZText><ZCommand
				{size}
				{items}
				inputLabel={size + ' 搜索命令'}
			/></ZStack
		>
	{/each}
</ZStack>
