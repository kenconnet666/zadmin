<script lang="ts">
	import {
		ZCombobox,
		ZComboboxContent,
		ZComboboxInput,
		ZSelect,
		ZSelectContent,
		ZSelectTrigger,
		type SelectionKey,
		type ZCollectionOption
	} from '../src/entrypoints/index.js';

	const options: readonly ZCollectionOption[] = Array.from({ length: 1000 }, (_, index) => ({
		disabled: index === 500,
		label: `Virtual option ${index + 1}`,
		value: index
	}));
	let selectValue = $state<SelectionKey | undefined>(0);
	let comboboxValue = $state<SelectionKey | undefined>(0);
	let inputValue = $state('Virtual option 1');
</script>

<ZSelect bind:value={selectValue} {options}>
	<ZSelectTrigger aria-label="Virtual select" data-testid="virtual-select-trigger" />
	<ZSelectContent data-testid="virtual-select-shell" virtual virtualHeight={160} />
</ZSelect>
<output data-testid="virtual-select-output">{selectValue}</output>

<ZCombobox bind:inputValue bind:value={comboboxValue} shouldFilter={false} {options}>
	<ZComboboxInput aria-label="Virtual combobox" data-testid="virtual-combobox-input" />
	<ZComboboxContent
		aria-label="Virtual combobox options"
		data-testid="virtual-combobox-shell"
		virtual
		virtualHeight={160}
	/>
</ZCombobox>
<output data-testid="virtual-combobox-output">{comboboxValue}:{inputValue}</output>
