<script lang="ts">
	import {
		ZAccordion,
		ZAccordionContent,
		ZAccordionItem,
		ZAccordionTrigger,
		ZText
	} from '@zadmin/zui';
	let value = $state<string | readonly string[] | undefined>(['build', 'deploy']);
</script>

<ZAccordion bind:value defaultValue={['build', 'deploy']} loop={false} type="multiple">
	<ZAccordionItem value="build"
		><ZAccordionTrigger textValue="构建">构建门禁</ZAccordionTrigger><ZAccordionContent
			>类型、格式和bundle检查。</ZAccordionContent
		></ZAccordionItem
	>
	<ZAccordionItem value="deploy"
		><ZAccordionTrigger textValue="部署">部署门禁</ZAccordionTrigger><ZAccordionContent
			>金丝雀与健康检查。</ZAccordionContent
		></ZAccordionItem
	>
	<ZAccordionItem value="audit"
		><ZAccordionTrigger textValue="审计">审计门禁</ZAccordionTrigger><ZAccordionContent
			>可访问性与运行时资源清理。</ZAccordionContent
		></ZAccordionItem
	>
</ZAccordion>
<ZText tone="muted">open = {Array.isArray(value) ? value.join(',') : (value ?? 'none')}</ZText>
