<script lang="ts">
	import {
		ZButton,
		ZCombobox,
		ZComboboxContent,
		ZComboboxInput,
		ZStack,
		ZText,
		type SelectionKey,
		type ZComboboxOption
	} from '@zadmin/zui';

	const options: readonly ZComboboxOption[] = Array.from({ length: 1000 }, (_, index) => ({
		disabled: index === 500,
		label: `环境 ${index + 1}`,
		value: index
	}));
	let inputValue = $state('环境 1');
	let value = $state<SelectionKey | undefined>(0);
</script>

<ZStack gap="small">
	<ZStack direction="row" gap="small" wrap>
		<ZButton
			variant="secondary"
			onclick={() => {
				value = 749;
				inputValue = '环境 750';
			}}>外部选择第 750 项</ZButton
		>
		<ZButton
			variant="secondary"
			onclick={() => {
				value = undefined;
				inputValue = '';
			}}>外部清空</ZButton
		>
	</ZStack>
	<ZCombobox bind:inputValue bind:value {options}>
		<ZComboboxInput aria-label="搜索大型环境集合" />
		<ZComboboxContent aria-label="大型环境建议" virtual virtualHeight={220} virtualItemSize={40} />
	</ZCombobox>
	<ZText tone="muted" size="small">
		输入始终拥有DOM焦点；过滤后的逻辑view驱动虚拟窗口，真实option挂载后才更新aria-activedescendant。value
		= {value ?? 'undefined'} · inputValue = {inputValue || "''"}
	</ZText>
</ZStack>
