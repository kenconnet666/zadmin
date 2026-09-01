<script lang="ts">
	import { ZMention, ZStack, ZText, type MentionItem } from '@zadmin/zui';

	const items: readonly MentionItem[] = Array.from({ length: 1000 }, (_, index) => ({
		key: index,
		label: `user-${String(index).padStart(4, '0')}`
	}));
	let value = $state('');
</script>

<ZStack gap="medium">
	<ZMention
		aria-label="千人成员目录"
		bind:value
		{items}
		maxSuggestions={1000}
		placeholder="输入 @ 后按 End 定位最后一项"
		virtual
		virtualHeight={260}
		virtualItemSize={52}
	/>
	<ZText tone="muted">value = {value || 'empty'}</ZText>
</ZStack>
