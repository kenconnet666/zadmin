<script lang="ts">
	import { ZCard, ZStack, ZText } from '@zadmin/zui';

	const levels = ['none', 'small', 'medium', 'large'] as const;
</script>

<ZStack direction="row" gap="medium" align="stretch" wrap>
	{#each levels as elevation (elevation)}
		<ZCard {elevation} data-testid={`card-elevation-${elevation}`}>
			<ZStack gap="small">
				<ZText weight="semibold">{elevation}</ZText>
				<ZText tone="muted">由Theme shadow.{elevation}提供层次。</ZText>
			</ZStack>
		</ZCard>
	{/each}
</ZStack>
