<script lang="ts">
	import { ZAccordion, ZAccordionItem, ZAccordionTrigger, ZAccordionContent } from '@zadmin/zui';
</script>

<ZAccordion type="single" defaultValue="details">
	<ZAccordionItem value="details">
		<ZAccordionTrigger appearance="inline">工具栏详情</ZAccordionTrigger>
		<ZAccordionContent
			>inline适合卡片工具栏或行内disclosure，仍保留原生button与ARIA关系。</ZAccordionContent
		>
	</ZAccordionItem>
</ZAccordion>
