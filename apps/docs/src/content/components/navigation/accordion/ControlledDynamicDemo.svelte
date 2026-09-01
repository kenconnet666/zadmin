<script lang="ts">
	import {
		ZAccordion,
		ZAccordionContent,
		ZAccordionItem,
		ZAccordionTrigger,
		ZButton,
		ZStack,
		ZText,
		type AccordionSingleValue,
		type SelectionKey
	} from '@zadmin/zui';

	let items = $state<SelectionKey[]>([1, '1', 'last']);
	let value = $state<AccordionSingleValue>(1);
	let activeValue = $state<SelectionKey | null>(1);
	const identity = (key: SelectionKey | null) =>
		key === null ? 'null' : `${typeof key}:${String(key)}`;
</script>

<ZStack gap="medium">
	<ZAccordion bind:activeValue bind:value>
		{#each items as key (key)}
			<ZAccordionItem value={key}>
				<ZAccordionTrigger>Item {identity(key)}</ZAccordionTrigger>
				<ZAccordionContent>Content for {identity(key)}</ZAccordionContent>
			</ZAccordionItem>
		{/each}
	</ZAccordion>
	<ZStack direction="row" gap="small" wrap>
		<ZButton onclick={() => (value = null)} variant="secondary">外部清空展开值</ZButton>
		<ZButton
			onclick={() => (items = items.filter((key) => key !== activeValue))}
			variant="secondary"
		>
			删除active项
		</ZButton>
		<ZButton onclick={() => (items = [...items].reverse())} variant="ghost">反转顺序</ZButton>
	</ZStack>
	<ZText tone="muted">value = {identity(value)} · active = {identity(activeValue)}</ZText>
</ZStack>
