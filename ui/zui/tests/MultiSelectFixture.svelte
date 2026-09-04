<script lang="ts">
	import {
		ZField,
		ZMultiSelect,
		ZMultiSelectContent,
		ZMultiSelectItem,
		ZMultiSelectTrigger
	} from '../src/entrypoints/index.js';

	let {
		defaultOpen = false,
		prevent = false,
		matchWidth = true,
		longLabels = false
	}: {
		defaultOpen?: boolean;
		prevent?: boolean;
		matchWidth?: boolean;
		longLabels?: boolean;
	} = $props();
	let value = $state<readonly (string | number)[]>(['a', 'c']);
	let open = $state<boolean>();
	let changes = $state(0);
</script>

<form data-testid="multi-select-form">
	<ZField
		description="Choose deployment targets"
		error={value.length === 0 ? 'At least one choice is required' : undefined}
		label="Choices"
		name="choice"
		required
	>
		<ZMultiSelect
			bind:open
			bind:value
			clearable
			{defaultOpen}
			{matchWidth}
			defaultValue={['a', 'c']}
			onValueChange={() => (changes += 1)}
			valueLabel={(current) =>
				({ a: 'Alpha', b: 'Beta', c: 'Charlie', d: 'Delta' })[String(current)]!}
		>
			<ZMultiSelectTrigger
				aria-label="Choices"
				data-testid="multi-select-trigger"
				style={longLabels ? 'inline-size: 80px' : undefined}
			/>
			<ZMultiSelectContent data-testid="multi-select-content">
				<ZMultiSelectItem data-testid="multi-a" value="a"
					>{longLabels ? '极光明亮主题' : 'Alpha'}</ZMultiSelectItem
				>
				<ZMultiSelectItem
					data-testid="multi-b"
					onSelect={(event) => prevent && event.preventDefault()}
					value="b"
					>Beta
				</ZMultiSelectItem>
				<ZMultiSelectItem data-testid="multi-c" value="c">Charlie</ZMultiSelectItem>
				<ZMultiSelectItem data-testid="multi-d" disabled value="d">Delta</ZMultiSelectItem>
			</ZMultiSelectContent>
		</ZMultiSelect>
	</ZField>
	<button data-testid="multi-select-owner-clear" type="button" onclick={() => (value = [])}
		>Clear owner values
	</button>
	<button type="reset">Reset</button>
</form>
<output data-testid="multi-select-output">{value.join(',')}:{changes}:{open}</output>
