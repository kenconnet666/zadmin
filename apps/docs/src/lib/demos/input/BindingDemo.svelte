<script lang="ts">
	import { ZInput, ZStack, ZText } from '@zadmin/zui';

	let value = $state('zadmin');
	let changes = $state(0);
</script>

<ZStack gap="medium">
	<ZInput
		bind:value
		data-testid="input-binding"
		placeholder="输入内容"
		onValueChange={() => (changes += 1)}
	/>
	<ZText tone="muted">value = {value || '空'} · 用户回调次数 = {changes}</ZText>
	<ZInput invalid value="invalid" aria-label="Invalid input example" />
</ZStack>
