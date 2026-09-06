<script lang="ts">
	import {
		controlSizes,
		ZStack,
		ZText,
		ZDropdownMenu,
		ZDropdownMenuTrigger,
		ZDropdownMenuContent,
		ZMenuItem
	} from '@zadmin/zui';
</script>

<ZStack gap="large">
	{#each controlSizes as size (size)}
		<ZStack gap="small"
			><ZText size="small">{size}</ZText><ZDropdownMenu
				><ZDropdownMenuTrigger {size} variant="outline">{size} 菜单</ZDropdownMenuTrigger
				><ZDropdownMenuContent {size}
					><ZMenuItem value="open">打开项目</ZMenuItem><ZMenuItem value="archive"
						>归档项目</ZMenuItem
					></ZDropdownMenuContent
				></ZDropdownMenu
			></ZStack
		>
	{/each}
</ZStack>
