<script lang="ts">
	import { ZText, ZVirtualList } from '@zadmin/zui';

	const items = Array.from({ length: 1000 }, (_, index) => ({
		id: index,
		label: `审计记录 ${index + 1}`
	}));
</script>

<ZVirtualList
	aria-label="从第501条开始的审计记录"
	{items}
	height={180}
	initialIndex={500}
	itemKey={(item) => item.id}
	itemSize={36}
	overscan={2}
>
	{#snippet item(entry)}<ZText>{entry.label}</ZText>{/snippet}
</ZVirtualList>
