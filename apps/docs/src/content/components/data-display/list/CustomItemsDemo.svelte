<script lang="ts">
	import { ZLink, ZList, ZStack, ZTag, ZText } from '@zadmin/zui';

	const items = [
		{ key: 'primary', label: '主数据库', description: '健康' },
		{ key: 'replica', label: '只读副本', description: '同步中' }
	];
</script>

<ZList {items}>
	{#snippet item(entry)}
		<ZStack align="center" direction="row" gap="medium">
			<ZText weight="semibold">{entry.label}</ZText>
			<ZTag tone={entry.key === 'primary' ? 'success' : 'warning'}>{entry.description}</ZTag>
		</ZStack>
	{/snippet}
	{#snippet action(entry)}
		<ZLink href={`#/components/list?database=${String(entry.key)}`}>详情</ZLink>
	{/snippet}
</ZList>
