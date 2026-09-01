<script lang="ts">
	import { ZBox, ZButton, ZStack, ZText, ZVirtualList } from '@zadmin/zui';

	interface AuditEntry {
		detail: string;
		id: string;
		title: string;
	}

	let sequence = 0;
	let entries = $state<AuditEntry[]>(
		Array.from({ length: 300 }, (_, index) => ({
			detail:
				index % 4 === 0
					? '该记录包含跨区域发布、审批证据与回滚说明，因此真实高度高于普通单行记录。'
					: '部署检查已完成。',
			id: `audit-${index}`,
			title: `审计记录 ${index + 1}`
		}))
	);

	function prepend(): void {
		sequence += 1;
		entries = [
			{
				detail: '新到达的记录插入顶部，viewport仍以原先首个可见业务key作为滚动锚点。',
				id: `new-${sequence}`,
				title: `实时记录 ${sequence}`
			},
			...entries
		];
	}
</script>

<ZStack direction="column" gap="small">
	<ZButton variant="secondary" onclick={prepend}>在顶部插入记录</ZButton>
	<ZVirtualList
		aria-label="动态高度审计记录"
		estimateSize={56}
		height={260}
		initialKey="audit-120"
		itemKey={(entry) => entry.id}
		items={entries}
		overscan={3}
	>
		{#snippet item(entry, _index, virtual)}
			<ZBox style="box-sizing: border-box; padding: 10px 12px;">
				<ZText weight="semibold">{entry.title}</ZText>
				<ZText tone="muted" size="small">{entry.detail}</ZText>
				<ZText tone="muted" size="small"
					>{virtual.measured ? '已按真实高度校准' : '使用估算高度'}</ZText
				>
			</ZBox>
		{/snippet}
	</ZVirtualList>
</ZStack>
