<script lang="ts">
	import { ZMention, ZStack, ZText } from '@zadmin/zui';
	const items = [
		{ key: 'deploy', label: 'deploy', description: '发布主题' },
		{ key: 'incident', label: 'incident', description: '事故主题' },
		{ key: 'release', label: 'release', description: '版本主题' }
	];
	let search = $state('none');
</script>

<ZStack gap="medium">
	<ZMention
		aria-label="带井号主题的消息"
		appendSpace={false}
		{items}
		maxSuggestions={3}
		minQueryLength={2}
		onSearchChange={(query, trigger) => (search = `${trigger}${query}`)}
		placeholder="输入 #de 搜索主题"
		triggers={['#']}
	/>
	<ZText tone="muted">search = {search}</ZText>
</ZStack>
