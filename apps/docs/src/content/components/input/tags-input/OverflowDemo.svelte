<script lang="ts">
	import { ZStack, ZTagsInput, ZText } from '@zadmin/zui';

	const initial = Array.from({ length: 12 }, (_, index) => `release-${index + 1}`);
	let values = $state<readonly string[]>(initial);
</script>

<ZStack gap="medium">
	<ZTagsInput
		aria-label="大量发布标签"
		bind:values
		defaultValues={initial}
		maxVisibleTags={3}
		overflowLabel={(omitted) => `还有 ${omitted.length} 个标签`}
	/>
	<ZText tone="muted">未聚焦时折叠视觉标签；聚焦后展开全部，12个业务值和FormData始终保留。</ZText>
</ZStack>
