<script lang="ts">
	import { ZStack, ZText, ZTransfer, type SelectionKey, type TransferItem } from '@zadmin/zui';

	const items: readonly TransferItem[] = Array.from({ length: 1000 }, (_, index) => ({
		description: index % 2 === 0 ? '主区域' : '灾备区域',
		disabled: index === 500,
		key: index,
		label: `节点 ${index + 1}`
	}));
	let value = $state<readonly SelectionKey[]>([0, 499, 999]);
</script>

<ZStack gap="small">
	<ZTransfer
		bind:value
		{items}
		name="node"
		searchPlaceholder="筛选千项节点"
		sourceTitle="可用节点"
		targetTitle="已选节点"
		virtual
		virtualHeight={260}
		virtualItemSize={52}
	/>
	<ZText tone="muted" size="small">
		两栏各自只挂载viewport与overscan，筛选、Ctrl/Command+A和移动仍针对完整逻辑view。value =
		{value.join(', ')}
	</ZText>
</ZStack>
