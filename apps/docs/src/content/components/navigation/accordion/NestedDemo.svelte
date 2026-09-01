<script lang="ts">
	import {
		ZAccordion,
		ZAccordionContent,
		ZAccordionItem,
		ZAccordionTrigger,
		ZProvider,
		ZText
	} from '@zadmin/zui';
</script>

<ZProvider direction="rtl">
	<ZAccordion defaultValue="platform" collapsible={false}>
		<ZAccordionItem value="platform">
			<ZAccordionTrigger headingLevel={3}>منصة / 平台</ZAccordionTrigger>
			<ZAccordionContent>
				<ZText>外层Panel保持region语义，内部Accordion使用独立Context。</ZText>
				<ZAccordion defaultValue={null}>
					<ZAccordionItem value="runtime">
						<ZAccordionTrigger headingLevel={4}>运行时</ZAccordionTrigger>
						<ZAccordionContent region={false}>
							轻量嵌套Panel关闭region以避免landmark泛滥。
						</ZAccordionContent>
					</ZAccordionItem>
				</ZAccordion>
			</ZAccordionContent>
		</ZAccordionItem>
	</ZAccordion>
</ZProvider>
