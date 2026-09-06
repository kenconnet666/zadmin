<script lang="ts">
	import {
		controlSizes,
		ZStack,
		ZText,
		ZDialog,
		ZDialogTrigger,
		ZDialogOverlay,
		ZDialogContent,
		ZDialogTitle,
		ZDialogDescription,
		ZDialogClose
	} from '@zadmin/zui';
</script>

<ZStack gap="large">
	{#each controlSizes as size (size)}
		<ZStack gap="small"
			><ZText size="small">{size}</ZText><ZDialog
				><ZDialogTrigger variant="outline">{size} 面板</ZDialogTrigger><ZDialogOverlay
				/><ZDialogContent {size}
					><ZDialogTitle>{size} Dialog</ZDialogTitle><ZDialogDescription
						>面板使用专用宽度 token，内部按钮按自己的 size 渲染。</ZDialogDescription
					><ZDialogClose variant="outline">关闭</ZDialogClose></ZDialogContent
				></ZDialog
			></ZStack
		>
	{/each}
</ZStack>
