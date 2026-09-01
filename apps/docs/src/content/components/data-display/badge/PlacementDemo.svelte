<script lang="ts">
	import { ZAvatar, ZBadge, ZStack, ZText, type BadgePlacement } from '@zadmin/zui';

	const placements: readonly BadgePlacement[] = [
		'top-start',
		'top-end',
		'bottom-start',
		'bottom-end'
	];
</script>

<ZStack align="center" direction="row" gap="xlarge" wrap>
	{#each placements as placement, index (placement)}
		<ZStack align="center" gap="small">
			<ZBadge count={index + 1} offset={[2, 2]} overlap="circular" {placement} tone="accent">
				<ZAvatar alt={placement} fallbackText={String(index + 1)} size="large" />
			</ZBadge>
			<ZText size="small">{placement}</ZText>
		</ZStack>
	{/each}
</ZStack>
