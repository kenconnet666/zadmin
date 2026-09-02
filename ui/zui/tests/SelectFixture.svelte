<script lang="ts">
	import {
		ZField,
		ZSelect,
		ZSelectContent,
		ZSelectItem,
		ZSelectTrigger
	} from '../src/entrypoints/index.js';
	let { defaultOpen = false, prevent = false }: { defaultOpen?: boolean; prevent?: boolean } =
		$props();
	let value = $state<string | number | undefined>('b');
	let open = $state<boolean>();
	let changes = $state(0);
</script>

<form data-testid="select-form">
	<ZField
		description="Choose one deployment target"
		error={value === undefined ? 'A choice is required' : undefined}
		label="Choice"
		name="choice"
		required
	>
		<ZSelect
			bind:open
			bind:value
			{defaultOpen}
			defaultValue="b"
			onValueChange={() => (changes += 1)}
			valueLabel={(current) =>
				({ a: 'Alpha', b: 'Beta', c: 'Charlie', d: 'Delta' })[String(current)]!}
		>
			<ZSelectTrigger aria-label="Choice" data-testid="select-trigger" />
			<ZSelectContent data-testid="select-content">
				<ZSelectItem data-testid="select-a" value="a">Alpha</ZSelectItem>
				<ZSelectItem data-testid="select-b" value="b">Beta</ZSelectItem>
				<ZSelectItem data-testid="select-c" disabled value="c">Charlie</ZSelectItem>
				<ZSelectItem
					data-testid="select-d"
					onSelect={(event) => prevent && event.preventDefault()}
					value="d">Delta</ZSelectItem
				>
			</ZSelectContent>
		</ZSelect>
	</ZField>
	<button data-testid="select-owner-clear" type="button" onclick={() => (value = undefined)}
		>Clear owner value</button
	>
	<button type="reset">Reset</button>
</form>
<output data-testid="select-output">{value}:{changes}:{open}</output>
