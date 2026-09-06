<script lang="ts">
	import { ZButton, ZStack, ZText, type ButtonTone, type ButtonVariant } from '@zadmin/zui';
	const tones: readonly ButtonTone[] = [
		'primary',
		'neutral',
		'info',
		'success',
		'warning',
		'danger'
	];
	const variants: readonly ButtonVariant[] = ['solid', 'outline', 'ghost'];
</script>

<ZStack gap="medium">
	{#each tones as tone (tone)}
		<ZStack align="center" direction="row" gap="small" wrap>
			<ZText size="small">{tone}</ZText>
			{#each variants as variant (variant)}<ZButton {tone} {variant}>{variant}</ZButton>{/each}
		</ZStack>
	{/each}
	<ZText tone="muted">primary表达品牌主操作；五种状态色独立于实心、描边和轻量外观。</ZText>
</ZStack>
