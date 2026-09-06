<script lang="ts">
	import { ZNavLink, ZProvider, ZStack, ZText } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const tones = ['primary', 'neutral', 'info', 'success', 'warning', 'danger'] as const;
	const variants = ['subtle', 'solid', 'outline'] as const;
	let compact = $state(false);
	let reduced = $state(false);
</script>

<ZProvider direction="rtl" motion={reduced ? 'reduced' : 'full'}>
	<ZStack gap="medium" style="max-width: 100%;">
		<ZStack direction="row" gap="small" wrap>
			<button type="button" onclick={() => (compact = !compact)}>compact={compact}</button>
			<button type="button" onclick={() => (reduced = !reduced)}
				>motion={reduced ? 'reduced' : 'full'}</button
			>
		</ZStack>
		<ZText weight="semibold">五档 size（固定tone=primary、variant=subtle）</ZText>
		{#each sizes as size (size)}
			<ZNavLink label={`导航 ${size}`} {size} {compact} />
		{/each}
		<ZText weight="semibold">六种 tone（固定size=medium、variant=subtle）</ZText>
		{#each tones as tone (tone)}
			<ZNavLink label={`语义 ${tone}`} {tone} />
		{/each}
		<ZText weight="semibold">三种 variant（固定size=medium、tone=primary）</ZText>
		{#each variants as variant (variant)}
			<ZNavLink label={`外观 ${variant}`} {variant} />
		{/each}
	</ZStack>
</ZProvider>
