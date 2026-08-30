<script lang="ts">
	import Bell from '@lucide/svelte/icons/bell';
	import { ZButton, ZStack, ZText, ZVisuallyHidden } from '@zadmin/zui';

	let count = $state(3);
</script>

<ZStack align="center" direction="row" gap="medium">
	<ZButton
		aria-label={`通知，${count}条未读`}
		size="small"
		variant="secondary"
		onclick={() => (count = 0)}
	>
		<Bell aria-hidden="true" size={16} />
		<ZVisuallyHidden>{count}条未读通知</ZVisuallyHidden>
	</ZButton>
	<ZText tone="muted">点击后未读数 = {count}</ZText>
</ZStack>
