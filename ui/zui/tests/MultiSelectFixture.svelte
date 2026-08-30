<script lang="ts">
	import {
		ZMultiSelect,
		ZMultiSelectContent,
		ZMultiSelectItem,
		ZMultiSelectTrigger
	} from '../src/entrypoints/index.js';
	let { defaultOpen = false, prevent = false }: { defaultOpen?: boolean; prevent?: boolean } =
		$props();
	let values = $state<readonly (string | number)[]>(['a', 'c']);
	let open = $state<boolean>();
	let changes = $state(0);
</script>

<form data-testid="multi-select-form">
	<ZMultiSelect
		bind:open
		bind:values
		{defaultOpen}
		defaultValues={['a', 'c']}
		name="choice"
		onValueChange={() => (changes += 1)}
		valueLabel={(current) =>
			({ a: 'Alpha', b: 'Beta', c: 'Charlie', d: 'Delta' })[String(current)]!}
	>
		<ZMultiSelectTrigger aria-label="Choices" data-testid="multi-select-trigger" />
		<ZMultiSelectContent data-testid="multi-select-content">
			<ZMultiSelectItem data-testid="multi-a" value="a">Alpha</ZMultiSelectItem>
			<ZMultiSelectItem
				data-testid="multi-b"
				onSelect={(event) => prevent && event.preventDefault()}
				value="b">Beta</ZMultiSelectItem
			>
			<ZMultiSelectItem data-testid="multi-c" value="c">Charlie</ZMultiSelectItem>
			<ZMultiSelectItem data-testid="multi-d" disabled value="d">Delta</ZMultiSelectItem>
		</ZMultiSelectContent>
	</ZMultiSelect>
	<button type="reset">Reset</button>
	<output data-testid="multi-select-output">{values.join(',')}:{changes}:{open}</output>
</form>
