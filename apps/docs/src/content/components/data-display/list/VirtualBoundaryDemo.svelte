<script lang="ts">
	import { ZText, ZVirtualList } from '@zadmin/zui';
	const items = Array.from({ length: 10_000 }, (_, index) => ({
		key: `event-${index}`,
		label: `审计事件 ${index + 1}`
	}));
</script>

<ZVirtualList
	aria-label="大型审计事件列表"
	height={240}
	itemKey={(entry) => entry.key}
	itemRole="listitem"
	itemSize={40}
	{items}
	role="list"
>
	{#snippet item(entry)}<ZText>{entry.label}</ZText>{/snippet}
</ZVirtualList>
