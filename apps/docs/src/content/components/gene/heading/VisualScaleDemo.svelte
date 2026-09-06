<script lang="ts">
	import { ZHeading, ZStack, ZText } from '@zadmin/zui';

	const sizes = [
		'xsmall',
		'small',
		'medium',
		'large',
		'xlarge',
		'xxlarge',
		'xxxlarge',
		'xxxxlarge'
	] as const;
</script>

<ZStack gap="medium">
	{#each sizes as size (size)}
		<ZHeading level={2} {size}>h2 · {size}</ZHeading>
	{/each}
	<ZText tone="muted"
		>八档字号保持相同h2语义；默认balance平衡窄屏标题，24px与32px分别使用xxlarge与xxxlarge。</ZText
	>
</ZStack>
