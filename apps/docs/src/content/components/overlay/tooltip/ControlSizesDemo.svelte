<script lang="ts">
	import {
		controlSizes,
		ZStack,
		ZText,
		ZTooltip,
		ZTooltipTrigger,
		ZTooltipContent
	} from '@zadmin/zui';
</script>

<ZStack gap="large">
	{#each controlSizes as size (size)}
		<ZStack gap="small"
			><ZText size="small">{size}</ZText><ZTooltip openDelay={0}
				><ZTooltipTrigger variant="outline">{size} 说明</ZTooltipTrigger><ZTooltipContent {size}
					>使用 inverseSurface / inverseText 与 tooltipMaxWidth；长说明按可用空间自动换行。</ZTooltipContent
				></ZTooltip
			></ZStack
		>
	{/each}
</ZStack>
