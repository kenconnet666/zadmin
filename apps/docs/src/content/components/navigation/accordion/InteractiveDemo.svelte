<script lang="ts">
	import {
		ZAccordion,
		ZAccordionContent,
		ZAccordionItem,
		ZAccordionTrigger,
		ZText
	} from '@zadmin/zui';

	let value = $state<string | readonly string[] | undefined>('runtime');
	let changes = $state(0);
</script>

<ZAccordion bind:value defaultValue="runtime" onValueChange={() => (changes += 1)}>
	<ZAccordionItem value="runtime">
		<ZAccordionTrigger textValue="运行时">运行时合同</ZAccordionTrigger>
		<ZAccordionContent>Collection、Selection与Presence拥有独立生命周期。</ZAccordionContent>
	</ZAccordionItem>
	<ZAccordionItem value="delivery">
		<ZAccordionTrigger textValue="交付">交付门禁</ZAccordionTrigger>
		<ZAccordionContent>类型、浏览器、bundle与外部安装在CI中验收。</ZAccordionContent>
	</ZAccordionItem>
	<ZAccordionItem disabled value="legacy">
		<ZAccordionTrigger textValue="旧版">旧版合同</ZAccordionTrigger>
		<ZAccordionContent>禁用项不会获得焦点或切换状态。</ZAccordionContent>
	</ZAccordionItem>
</ZAccordion>
<ZText tone="muted">
	value = {value === undefined ? 'none' : typeof value === 'string' ? value : value.join(',')} · 用户变更次数
	= {changes}
</ZText>
