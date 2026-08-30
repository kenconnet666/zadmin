<script lang="ts">
	import {
		ZSelect,
		ZSelectContent,
		ZSelectItem,
		ZSelectTrigger
	} from '../src/entrypoints/index.js';
	let { defaultOpen = false, prevent = false }: { defaultOpen?: boolean; prevent?: boolean } =
		$props();
	let value = $state<string | number>('b');
	let open = $state<boolean>();
	let changes = $state(0);
</script>

<form data-testid="select-form">
	<ZSelect
		bind:open
		bind:value
		{defaultOpen}
		defaultValue="b"
		name="choice"
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
	<button type="reset">Reset</button>
	<output data-testid="select-output">{value}:{changes}:{open}</output>
</form>
