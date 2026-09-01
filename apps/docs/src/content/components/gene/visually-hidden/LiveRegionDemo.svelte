<script lang="ts">
	import { ZButton, ZStack, ZText, ZVisuallyHidden } from '@zadmin/zui';

	let count = $state(0);
</script>

<ZStack gap="small">
	<ZButton onclick={() => (count += 1)}>增加任务</ZButton>
	<ZText>视觉计数：{count}</ZText>
	<ZVisuallyHidden aria-atomic="true" aria-live="polite" role="status">
		当前有{count}个待处理任务
	</ZVisuallyHidden>
</ZStack>
