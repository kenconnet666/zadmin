<script lang="ts">
	import {
		ZCombobox,
		ZComboboxContent,
		ZComboboxInput,
		ZComboboxItem
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
	let value = $state<string | number>('b');
	let inputValue = $state('Beta');
	let open = $state<boolean>();
	let changes = $state(0);
</script>

<form data-testid="combobox-form">
	<ZCombobox
		bind:inputValue
		bind:open
		bind:value
		defaultInputValue="Beta"
		{defaultOpen}
		{matchWidth}
		defaultValue="b"
		name="choice"
		onValueChange={() => (changes += 1)}
	>
		<ZComboboxInput
			aria-label="Choice search"
			data-testid="combobox-input"
			id="fixture-combobox"
			style={longLabels ? 'inline-size: 80px' : undefined}
		/>
		<ZComboboxContent aria-label="Choices" data-testid="combobox-content">
			<ZComboboxItem
				data-testid="combobox-a"
				textValue={longLabels ? '极光明亮主题' : 'Alpha'}
				value="a">{longLabels ? '极光明亮主题' : 'Alpha'}</ZComboboxItem
			>
			<ZComboboxItem data-testid="combobox-b" textValue="Beta" value="b">Beta</ZComboboxItem>
			<ZComboboxItem data-testid="combobox-c" disabled textValue="Charlie" value="c"
				>Charlie</ZComboboxItem
			>
			<ZComboboxItem
				data-testid="combobox-d"
				onSelect={(event) => prevent && event.preventDefault()}
				textValue="Delta"
				value="d">Delta</ZComboboxItem
			>
		</ZComboboxContent>
	</ZCombobox>
	<button type="reset">Reset</button>
</form>
<!-- Keep diagnostics outside the reset owner; native reset may mutate output.value. -->
<output data-testid="combobox-output">{value}:{inputValue}:{changes}:{open}</output>
