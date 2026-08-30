<script lang="ts">
	import { ZBadge, ZList, ZStack, ZText } from '@zadmin/zui';

	const items = [
		{ id: 'primary', label: '主数据库', description: '健康' },
		{ id: 'replica', label: '只读副本', description: '同步中' }
	];
</script>

<ZList {items}>
	{#snippet item(entry)}
		<ZStack align="center" direction="row" gap="medium">
			<ZText weight="semibold">{entry.label}</ZText>
			<ZBadge tone={entry.id === 'primary' ? 'success' : 'warning'}>{entry.description}</ZBadge>
		</ZStack>
	{/snippet}
</ZList>
