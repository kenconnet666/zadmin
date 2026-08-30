<script lang="ts">
	import { ZText, ZVirtualList } from '@zadmin/zui';
	const items = Array.from({ length: 10000 }, (_, index) => ({
		id: `deployment-${index}`,
		name: `部署记录 ${index + 1}`
	}));
	let range = $state('0–0');
</script>

<ZText tone="muted">可见区间 = {range} / 10000</ZText>
<ZVirtualList
	ariaLabel="一万条部署记录"
	{items}
	itemKey={(item) => item.id}
	itemSize={40}
	height={240}
	onRangeChange={(next) => (range = `${next.startIndex}–${next.endIndex}`)}
	data-testid="docs-virtual-list"
>
	{#snippet item(entry, index)}<ZText>{index + 1}. {entry.name}</ZText>{/snippet}
</ZVirtualList>
