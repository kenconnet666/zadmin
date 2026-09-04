<script lang="ts">
	import { ZButton, ZStack, ZText } from '@zadmin/zui';

	let count = $state(0);
</script>

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="small" wrap>
		<ZButton size="small">Small</ZButton>
		<ZButton size="medium">Medium</ZButton>
		<ZButton size="large">Large</ZButton>
		<ZButton loading>Loading</ZButton>
		<ZButton disabled>Disabled</ZButton>
	</ZStack>
	<ZStack direction="row" gap="small" align="center">
		<ZButton data-testid="button-counter" onclick={() => (count += 1)}>点击计数</ZButton>
		<ZText tone="muted">count = {count}</ZText>
	</ZStack>
</ZStack>
