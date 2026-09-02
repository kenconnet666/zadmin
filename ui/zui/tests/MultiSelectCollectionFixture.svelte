<script lang="ts">
	import {
		ZMultiSelect,
		ZMultiSelectContent,
		ZMultiSelectTrigger,
		type SelectionKey,
		type ZMultiSelectOption
	} from '../src/entrypoints/index.js';

	const groupedOptions: readonly ZMultiSelectOption[] = [
		{ group: 'Typed', label: 'Number one', value: 1 },
		{ group: 'Typed', label: 'String one', value: '1' },
		{ disabled: true, group: 'State', label: 'Disabled', value: 'disabled' },
		{ group: 'State', label: 'Stable', value: 'stable' }
	];
	const virtualOptions: readonly ZMultiSelectOption[] = Array.from({ length: 200 }, (_, index) => ({
		disabled: index === 100,
		label: `Virtual ${index + 1}`,
		value: index
	}));
	let options = $state(groupedOptions);
	let value = $state<readonly SelectionKey[]>([1, '1', 'orphan']);
	let changes = $state(0);
	let legacyValues = $state<readonly SelectionKey[]>(['stable']);
	let legacyChanges = $state(0);
	const collectionOutput = $derived(
		`${value.map((key) => `${typeof key}:${key}`).join('|')}:${changes}`
	);
</script>

<form data-testid="multi-collection-form">
	<ZMultiSelect
		bind:value
		clearable
		defaultValue={[1, '1', 'orphan']}
		maxTagCount={2}
		name="choice"
		{options}
		onValueChange={() => (changes += 1)}
		valueLabel={(key) => (key === 'orphan' ? 'Remote orphan' : String(key))}
	>
		<ZMultiSelectTrigger aria-label="Typed choices" data-testid="multi-collection-trigger" />
		<ZMultiSelectContent data-testid="multi-collection-content" />
	</ZMultiSelect>
	<button type="button" data-testid="multi-empty-options" onclick={() => (options = [])}>
		Empty remote page
	</button>
	<button
		type="button"
		data-testid="multi-restore-options"
		onclick={() => (options = groupedOptions)}
	>
		Restore options
	</button>
	<button type="reset">Reset</button>
	<output data-testid="multi-collection-output">{collectionOutput}</output>
</form>

<ZMultiSelect readonly defaultValue={['stable']} options={groupedOptions}>
	<ZMultiSelectTrigger aria-label="Readonly choices" data-testid="multi-readonly-trigger" />
	<ZMultiSelectContent data-testid="multi-readonly-content" />
</ZMultiSelect>

<ZMultiSelect defaultValue={[0, 199]} options={virtualOptions}>
	<ZMultiSelectTrigger aria-label="Virtual choices" data-testid="multi-virtual-trigger" />
	<ZMultiSelectContent data-testid="multi-virtual-content" virtual virtualHeight={160} />
</ZMultiSelect>

<ZMultiSelect
	bind:values={legacyValues}
	defaultValues={['stable']}
	onValuesChange={() => (legacyChanges += 1)}
	options={groupedOptions}
>
	<ZMultiSelectTrigger aria-label="Legacy choices" data-testid="multi-legacy-trigger" />
	<ZMultiSelectContent data-testid="multi-legacy-content" />
</ZMultiSelect>
<output data-testid="multi-legacy-output">{legacyValues.join(',')}:{legacyChanges}</output>
