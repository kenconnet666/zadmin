<script lang="ts">
	import { controlSizes, ZStack, ZText, ZCommandPalette } from '@zadmin/zui';
	const items = [
		{ key: 'server-a', label: '外部搜索结果 A' },
		{ key: 'server-b', label: '外部搜索结果 B' },
		{ key: 'server-c', label: '外部搜索结果 C' }
	];
</script>

<ZStack gap="large">
	{#each controlSizes as size (size)}
		<ZStack gap="small"
			><ZText size="small">{size}</ZText><ZCommandPalette
				{size}
				panelSize={size}
				{items}
				shouldFilter={false}
				maxResults={2}
				defaultQuery="远端查询"
				triggerLabel={size + ' 外部搜索'}
				title="外部搜索结果"
				resultsLabel={(count) => '展示 ' + count + ' 个结果'}
				description="调用方拥有搜索结果；shouldFilter=false 不再本地过滤，maxResults 限制展示数量。"
			/></ZStack
		>
	{/each}
</ZStack>
