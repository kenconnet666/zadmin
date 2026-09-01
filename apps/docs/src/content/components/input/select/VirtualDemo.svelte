<script lang="ts">
	import {
		ZButton,
		ZSelect,
		ZSelectContent,
		ZSelectTrigger,
		ZStack,
		ZText,
		type SelectionKey,
		type ZSelectOption
	} from '@zadmin/zui';

	const options: readonly ZSelectOption[] = Array.from({ length: 1000 }, (_, index) => ({
		disabled: index === 500,
		label: `环境 ${index + 1}`,
		value: index
	}));
	let value = $state<SelectionKey | undefined>(0);
</script>

<ZStack gap="small">
	<ZStack direction="row" gap="small" wrap>
		<ZButton variant="secondary" onclick={() => (value = 749)}>外部选择第 750 项</ZButton>
		<ZButton variant="secondary" onclick={() => (value = undefined)}>外部清空</ZButton>
	</ZStack>
	<ZSelect bind:value {options} valueLabel={(key) => `环境 ${Number(key) + 1}`}>
		<ZSelectTrigger aria-label="大型单选环境集合" />
		<ZSelectContent virtual virtualHeight={220} virtualItemSize={40} />
	</ZSelect>
	<ZText tone="muted" size="small">
		1000
		个无分组选项共享完整逻辑顺序；虚拟器只拥有窗口和按key滚动，选择仍由SelectionModel拥有。value = {value ??
			'undefined'}
	</ZText>
</ZStack>
