<script lang="ts">
	import { ZButton, ZStack, ZText, ZToggleButton } from '@zadmin/zui';

	let pressed = $state(false);
	let changes = $state(0);
</script>

<ZStack gap="medium">
	<ZToggleButton bind:pressed onPressedChange={() => (changes += 1)}>实时监控</ZToggleButton>
	<ZStack direction="row" gap="small" wrap>
		<ZButton onclick={() => (pressed = true)} variant="secondary">Owner设为true</ZButton>
		<ZButton onclick={() => (pressed = false)} variant="secondary">Owner设为false</ZButton>
	</ZStack>
	<ZText tone="muted"
		>pressed = {pressed} · 用户回调 = {changes}；外部同步不会伪造onPressedChange。</ZText
	>
</ZStack>
