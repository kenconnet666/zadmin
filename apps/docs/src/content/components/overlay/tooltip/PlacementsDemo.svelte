<script lang="ts">
	import { ZStack, ZTooltip, ZTooltipContent, ZTooltipTrigger } from '@zadmin/zui';
	const placements = ['top', 'right', 'bottom', 'left'] as const;
</script>

<ZStack align="center" direction="row" gap="large" wrap>
	{#each placements as placement}
		<ZTooltip closeDelay={0} delay={0} {placement}>
			<ZTooltipTrigger variant="secondary">{placement}</ZTooltipTrigger>
			<ZTooltipContent>{placement}位置说明</ZTooltipContent>
		</ZTooltip>
	{/each}
</ZStack>
