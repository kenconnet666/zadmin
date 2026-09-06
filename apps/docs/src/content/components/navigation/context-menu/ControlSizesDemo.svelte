<script lang="ts">
	import {
		controlSizes,
		ZStack,
		ZText,
		ZContextMenu,
		ZContextMenuTrigger,
		ZContextMenuContent,
		ZMenuItem
	} from '@zadmin/zui';
</script>

<ZStack gap="large">
	{#each controlSizes as size (size)}
		<ZStack gap="small"
			><ZText size="small">{size}</ZText><ZContextMenu
				><ZContextMenuTrigger>{size}：右键或 Shift+F10</ZContextMenuTrigger><ZContextMenuContent
					{size}
					><ZMenuItem value="open">打开</ZMenuItem><ZMenuItem value="copy">复制位置</ZMenuItem
					></ZContextMenuContent
				></ZContextMenu
			></ZStack
		>
	{/each}
</ZStack>
