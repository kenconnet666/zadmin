<script lang="ts">
	import { ZButton, ZEmpty, ZSpinner, ZStack, ZVirtualList } from '@zadmin/zui';

	let loading = $state(true);
	const noItems: readonly { id: string }[] = [];
</script>

<ZStack direction="column" gap="small">
	<ZButton variant="secondary" onclick={() => (loading = !loading)}>
		切换为{loading ? '空结果' : '加载中'}
	</ZButton>
	<ZVirtualList
		aria-label="部署记录状态"
		height={180}
		itemKey={(entry) => entry.id}
		items={noItems}
		{loading}
	>
		{#snippet item(entry)}{entry.id}{/snippet}
		{#snippet loadingContent()}
			<ZStack align="center" gap="small">
				<ZSpinner label="正在加载部署记录" />
				正在加载部署记录
			</ZStack>
		{/snippet}
		{#snippet empty()}
			<ZEmpty title="没有部署记录">调整筛选条件或稍后重试。</ZEmpty>
		{/snippet}
	</ZVirtualList>
</ZStack>
