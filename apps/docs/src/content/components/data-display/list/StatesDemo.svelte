<script lang="ts">
	import { ZEmpty, ZList, ZStack, ZText } from '@zadmin/zui';
	const items = [{ key: 'ready', label: '生产部署', description: '最近一次部署成功' }];
</script>

<ZStack gap="large">
	<ZStack gap="small">
		<ZText weight="semibold">默认空状态</ZText>
		<ZList aria-label="空部署列表" emptyText="没有部署记录" items={[]} />
	</ZStack>
	<ZStack gap="small">
		<ZText weight="semibold">自定义空状态</ZText>
		<ZList aria-label="空搜索结果" items={[]}>
			{#snippet empty()}<ZEmpty title="没有匹配结果">请调整筛选条件。</ZEmpty>{/snippet}
		</ZList>
	</ZStack>
	<ZStack gap="small">
		<ZText weight="semibold">加载中</ZText>
		<ZList aria-label="正在加载部署" {items} loading loadingCount={2} />
	</ZStack>
</ZStack>
