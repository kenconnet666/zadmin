<script lang="ts">
	import {
		ZButton,
		ZMultiSelect,
		ZMultiSelectContent,
		ZMultiSelectTrigger,
		ZStack,
		ZText,
		type SelectionKey,
		type ZMultiSelectOption
	} from '@zadmin/zui';

	const options: readonly ZMultiSelectOption[] = Array.from({ length: 1000 }, (_, index) => ({
		disabled: index === 500,
		label: `环境 ${index + 1}`,
		value: index
	}));
	let value = $state<readonly SelectionKey[]>([0, 499, 999]);
</script>

<ZStack gap="small">
	<ZStack direction="row" gap="small" wrap>
		<ZButton variant="secondary" onclick={() => (value = [0, 749, 999])}>选择第 750 项</ZButton>
		<ZButton variant="secondary" onclick={() => (value = [])}>外部清空</ZButton>
	</ZStack>
	<ZMultiSelect bind:value maxTagCount={2} {options}>
		<ZMultiSelectTrigger aria-label="大型环境集合" />
		<ZMultiSelectContent virtual virtualHeight={220} virtualItemSize={40} />
	</ZMultiSelect>
	<ZText tone="muted" size="small">
		1000 个权威、无分组选项共享同一逻辑选择；虚拟器只拥有挂载窗口和按 key 滚动。
	</ZText>
</ZStack>
