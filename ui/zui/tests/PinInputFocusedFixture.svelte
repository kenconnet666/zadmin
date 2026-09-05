<script lang="ts">
	import { ZButton, ZPinInput, ZText } from '../src/entrypoints/index.js';

	let editableValue = $state('1234');
	let dynamicValue = $state('123456');
	let dynamicLength = $state(6);
	let changes = $state(0);
	let completes = $state(0);
</script>

<form data-testid="pin-focused-form">
	<ZPinInput
		data-testid="pin-focused-readonly"
		defaultValue="1234"
		inputLabel={(index, length) => `Readonly ${index + 1} of ${length}`}
		length={4}
		readonly
	/>
	<ZPinInput
		bind:value={editableValue}
		data-testid="pin-focused-editable"
		defaultValue="1234"
		inputLabel={(index, length) => `Editable ${index + 1} of ${length}`}
		length={4}
		onComplete={() => (completes += 1)}
		onValueChange={() => (changes += 1)}
	/>
	<ZPinInput
		autocomplete="one-time-code"
		data-testid="pin-focused-autofill"
		inputLabel={(index, length) => `Autofill ${index + 1} of ${length}`}
		length={4}
		mask
	/>
	<ZPinInput
		bind:value={dynamicValue}
		data-testid="pin-focused-dynamic"
		defaultValue="123456"
		inputLabel={(index, length) => `Dynamic ${index + 1} of ${length}`}
		length={dynamicLength}
		name="focused-pin"
	/>
	<ZButton data-testid="pin-focused-shrink" type="button" onclick={() => (dynamicLength = 3)}>
		Shrink
	</ZButton>
	<ZButton data-testid="pin-focused-reset" type="reset">Reset</ZButton>
</form>
<ZText data-testid="pin-focused-output">{editableValue}:{dynamicValue}:{changes}:{completes}</ZText>
