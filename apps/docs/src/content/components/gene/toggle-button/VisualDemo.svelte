<script lang="ts">
	import { ZStack, ZToggleButton, type ButtonTone } from '@zadmin/zui';

	const tones: readonly ButtonTone[] = [
		'primary',
		'neutral',
		'info',
		'success',
		'warning',
		'danger'
	];
</script>

<ZStack gap="medium">
	{#each tones as tone (tone)}
		<ZStack direction="row" gap="small" wrap>
			<ZToggleButton {tone} defaultPressed variant="solid">{tone} · Solid</ZToggleButton>
			<ZToggleButton {tone} defaultPressed variant="outline">{tone} · Outline</ZToggleButton>
			<ZToggleButton {tone} defaultPressed variant="ghost">{tone} · Ghost</ZToggleButton>
		</ZStack>
	{/each}
</ZStack>
