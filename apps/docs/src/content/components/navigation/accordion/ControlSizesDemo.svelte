<script lang="ts">
	import {
		controlSizes,
		ZStack,
		ZText,
		ZAccordion,
		ZAccordionItem,
		ZAccordionTrigger,
		ZAccordionContent
	} from '@zadmin/zui';
</script>

<ZStack gap="large">
	{#each controlSizes as size (size)}
		<ZStack gap="small"
			><ZText size="small">{size}</ZText><ZAccordion {size} defaultValue="details"
				><ZAccordionItem value="details"
					><ZAccordionTrigger>{size} 部署说明</ZAccordionTrigger><ZAccordionContent
						>Trigger、字体和指示器统一使用当前尺寸，内容布局保持独立。</ZAccordionContent
					></ZAccordionItem
				></ZAccordion
			></ZStack
		>
	{/each}
</ZStack>
