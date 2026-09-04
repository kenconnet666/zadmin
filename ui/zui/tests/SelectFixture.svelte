<script lang="ts">
	import {
		ZField,
		ZSelect,
		ZSelectContent,
		ZSelectItem,
		ZSelectTrigger
	} from '../src/entrypoints/index.js';
	let {
		defaultOpen = false,
		matchWidth = true,
		prevent = false,
		longLabels = false
	}: {
		defaultOpen?: boolean;
		matchWidth?: boolean;
		prevent?: boolean;
		longLabels?: boolean;
	} = $props();
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
			{matchWidth}
			defaultValue="b"
			onValueChange={() => (changes += 1)}
			valueLabel={(current) =>
				({ a: 'Alpha', b: 'Beta', c: 'Charlie', d: 'Delta' })[String(current)]!}
		>
			<ZSelectTrigger
				aria-label="Choice"
				data-testid="select-trigger"
				style={longLabels ? 'inline-size: 80px' : undefined}
			/>
			<ZSelectContent data-testid="select-content">
				<ZSelectItem data-testid="select-a" value="a"
					>{longLabels ? '极光明亮主题' : 'Alpha'}</ZSelectItem
				>
				<ZSelectItem data-testid="select-b" value="b"
					>{longLabels ? '纸张暖白主题' : 'Beta'}</ZSelectItem
				>
				<ZSelectItem data-testid="select-c" disabled value="c"
					>{longLabels ? '高对比暗色主题' : 'Charlie'}</ZSelectItem
				>
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
