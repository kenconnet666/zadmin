<script lang="ts">
	import { ZButton, ZStack, ZText } from '@zadmin/zui';

	let count = $state(0);
</script>

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="small" wrap>
		<ZButton size="xsmall">XSmall</ZButton>
		<ZButton size="small">Small</ZButton>
		<ZButton size="medium">Medium</ZButton>
		<ZButton size="large">Large</ZButton>
		<ZButton size="xlarge">XLarge</ZButton>
	</ZStack>
	<ZStack align="center" direction="row" gap="small" wrap>
		<ZButton aria-label="加载中的按钮" loading>Loading</ZButton>
		<ZButton aria-label="已禁用的按钮" disabled>Disabled</ZButton>
	</ZStack>
	<ZStack direction="row" gap="small" align="center">
		<ZButton aria-label="增加按钮计数" data-testid="button-counter" onclick={() => (count += 1)}
			>点击计数</ZButton
		>
		<ZText tone="muted">count = {count}</ZText>
	</ZStack>
</ZStack>
