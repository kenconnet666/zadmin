<script lang="ts">
	import {
		ZAccordion,
		ZAccordionContent,
		ZAccordionItem,
		ZAccordionTrigger,
		ZButton,
		ZStack,
		ZText,
		type AccordionType,
		type AccordionValue
	} from '@zadmin/zui';

	let type = $state<AccordionType>('single');
	let value = $state<AccordionValue>('build');

	function useSingle(): void {
		type = 'single';
		value = 'build';
	}
	function useMultiple(): void {
		type = 'multiple';
		value = ['build', 'verify'];
	}
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton onclick={useSingle} variant={type === 'single' ? 'primary' : 'secondary'}>
			Single mode
		</ZButton>
		<ZButton onclick={useMultiple} variant={type === 'multiple' ? 'primary' : 'secondary'}>
			Multiple mode
		</ZButton>
	</ZStack>
	<ZAccordion bind:value collapsible={type === 'single' ? false : undefined} {type}>
		<ZAccordionItem value="build">
			<ZAccordionTrigger>构建</ZAccordionTrigger>
			<ZAccordionContent>生成生产制品。</ZAccordionContent>
		</ZAccordionItem>
		<ZAccordionItem value="verify">
			<ZAccordionTrigger>验证</ZAccordionTrigger>
			<ZAccordionContent>运行浏览器和CI合同。</ZAccordionContent>
		</ZAccordionItem>
	</ZAccordion>
	<ZText tone="muted">
		type = {type} · value = {Array.isArray(value) ? `[${value.join(',')}]` : (value ?? 'null')}
	</ZText>
</ZStack>
