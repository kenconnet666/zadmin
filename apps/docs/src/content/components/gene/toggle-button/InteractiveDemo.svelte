<script lang="ts">
	import { ZStack, ZText, ZToggleButton } from '@zadmin/zui';
	import { Bold } from '@lucide/svelte';

	let pressed = $state(false);
	let changes = $state(0);
</script>

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="small" wrap>
		<ZToggleButton
			bind:pressed
			data-testid="toggle-button-controlled"
			onPressedChange={() => (changes += 1)}
		>
			{#snippet start()}<Bold aria-hidden="true" size={16} />{/snippet}
			粗体
		</ZToggleButton>
		<ZToggleButton defaultPressed>默认开启</ZToggleButton>
		<ZToggleButton disabled>不可用</ZToggleButton>
	</ZStack>
	<ZText tone="muted">pressed = {pressed} · 用户变更次数 = {changes}</ZText>
</ZStack>
