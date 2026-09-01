<script lang="ts">
	import {
		ZAccordion,
		ZAccordionContent,
		ZAccordionItem,
		ZAccordionTrigger,
		ZProvider,
		ZStack,
		ZText
	} from '@zadmin/zui';
</script>

<ZStack direction="row" gap="large" wrap>
	<ZProvider motion="full">
		<ZStack gap="small">
			<ZText tone="muted">完整动画：grid row + opacity + indicator旋转</ZText>
			<ZAccordion defaultValue="full">
				<ZAccordionItem value="full">
					<ZAccordionTrigger>Full motion</ZAccordionTrigger>
					<ZAccordionContent>关闭时Presence保留DOM至transitionend。</ZAccordionContent>
				</ZAccordionItem>
			</ZAccordion>
		</ZStack>
	</ZProvider>
	<ZProvider motion="reduced">
		<ZStack gap="small">
			<ZText tone="muted">减少动画：立即完成退出并清理Presence</ZText>
			<ZAccordion defaultValue="reduced">
				<ZAccordionItem value="reduced">
					<ZAccordionTrigger>Reduced motion</ZAccordionTrigger>
					<ZAccordionContent>不保留不可见的退出DOM。</ZAccordionContent>
				</ZAccordionItem>
			</ZAccordion>
		</ZStack>
	</ZProvider>
</ZStack>
