<script lang="ts">
	import { ZButton, ZColorPicker, ZStack, ZText } from '@zadmin/zui';

	let value = $state<string | null>('#7c3aed');
	let open = $state(false);
	let changes = $state(0);
</script>

<ZStack gap="medium">
	<ZColorPicker
		bind:open
		bind:value
		clearable
		onValueChange={() => (changes += 1)}
		placeholder="未选择颜色"
	/>
	<ZStack direction="row" gap="small" wrap>
		<ZButton onclick={() => (value = null)} variant="secondary">外部清空</ZButton>
		<ZButton onclick={() => (value = '#0ea5e9')} variant="secondary">外部设置蓝色</ZButton>
		<ZButton onclick={() => (open = true)} variant="secondary">外部打开</ZButton>
	</ZStack>
	<ZText tone="muted">value = {value ?? 'null'} · open = {open} · 用户变更 = {changes}</ZText>
</ZStack>
