<script lang="ts">
	import { ZDescriptionList, ZLink, ZStack, ZTag, ZText } from '@zadmin/zui';
	const items = [
		{ key: 1, term: 'number 1', description: '生产环境' },
		{ key: '1', term: 'string 1', description: '预发布环境' }
	];
</script>

<ZDescriptionList {items}>
	{#snippet term(entry)}
		<ZStack align="center" direction="row" gap="small">
			<ZText weight="semibold">{entry.term}</ZText>
			<ZTag>{typeof entry.key}</ZTag>
		</ZStack>
	{/snippet}
	{#snippet description(entry)}<ZText>{entry.description}配置</ZText>{/snippet}
	{#snippet action(entry)}
		<ZLink href={`#/components/description-list?environment=${String(entry.key)}`}>查看</ZLink>
	{/snippet}
</ZDescriptionList>
