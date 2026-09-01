<script lang="ts">
	import {
		ZCombobox,
		ZComboboxContent,
		ZComboboxInput,
		ZSelect,
		ZSelectContent,
		ZSelectTrigger,
		type SelectionKey,
		type ZComboboxOption,
		type ZSelectOption
	} from '../src/entrypoints/index.js';

	const baseOptions = [
		{ group: 'Numbers', label: 'Number one', value: 1 },
		{ group: 'Strings', label: 'String one', value: '1' },
		{ group: 'Strings', label: 'Disabled', value: 'disabled', disabled: true }
	] satisfies readonly ZSelectOption[] & readonly ZComboboxOption[];
	let selectOptions = $state<readonly ZSelectOption[]>(baseOptions);
	let selectValue = $state<SelectionKey | undefined>(1);
	let comboInput = $state('');
	let comboValue = $state<SelectionKey | undefined>();
</script>

<form data-testid="choice-collection-form">
	<ZSelect
		bind:value={selectValue}
		name="select-choice"
		options={selectOptions}
		valueLabel={(key) => (Object.is(key, 1) ? 'Number one' : String(key))}
	>
		<ZSelectTrigger aria-label="Typed select" data-testid="typed-select-trigger" />
		<ZSelectContent data-testid="typed-select-content">
			{#snippet option(option)}<span data-key-type={typeof option.value}>{option.label}</span
				>{/snippet}
		</ZSelectContent>
	</ZSelect>
	<ZCombobox
		bind:inputValue={comboInput}
		bind:value={comboValue}
		name="combo-choice"
		options={baseOptions}
	>
		<ZComboboxInput aria-label="Typed combobox" data-testid="typed-combobox-input" />
		<ZComboboxContent aria-label="Typed combobox options" data-testid="typed-combobox-content">
			{#snippet option(option)}<span data-key-type={typeof option.value}>{option.label}</span
				>{/snippet}
		</ZComboboxContent>
	</ZCombobox>
	<ZSelect readonly defaultValue="1" name="readonly-select" options={baseOptions}>
		<ZSelectTrigger aria-label="Readonly select" data-testid="readonly-select-trigger" />
		<ZSelectContent data-testid="readonly-select-content" />
	</ZSelect>
	<ZCombobox
		readonly
		defaultInputValue="String one"
		defaultValue="1"
		name="readonly-combo"
		options={baseOptions}
	>
		<ZComboboxInput aria-label="Readonly combobox" data-testid="readonly-combobox-input" />
		<ZComboboxContent data-testid="readonly-combobox-content" />
	</ZCombobox>
	<button
		type="button"
		data-testid="remove-selected"
		onclick={() => (selectOptions = baseOptions.filter((option) => !Object.is(option.value, '1')))}
	>
		Remove selected option
	</button>
	<output data-testid="choice-collection-output">
		{String(selectValue)}:{typeof selectValue}:{String(comboValue)}:{typeof comboValue}:{comboInput}
	</output>
</form>
