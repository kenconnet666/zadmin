<script lang="ts">
	import { ZBox, ZButton, ZField, ZStack, ZTextarea } from '../src/entrypoints/index.js';

	let changes = $state(0);
	let composing = $state(false);
	let hidden = $state(true);
	let value = $state('Seed');
</script>

<form data-testid="textarea-production-form" id="textarea-production-form">
	<ZStack direction="row" gap="small">
		<ZButton data-testid="textarea-production-clear" onclick={() => (value = '')} type="button">
			Clear externally
		</ZButton>
		<ZButton type="reset">Reset</ZButton>
	</ZStack>
</form>

<ZField description="Production description" label="Description" name="description" required>
	<ZTextarea
		autosize={{ minRows: 2, maxRows: 4 }}
		bind:value
		data-testid="textarea-production-control"
		defaultValue="Seed"
		form="textarea-production-form"
		maxlength={40}
		oncompositionend={() => (composing = false)}
		oncompositionstart={() => (composing = true)}
		onValueChange={() => (changes += 1)}
		rows={2}
	/>
</ZField>
<output data-testid="textarea-production-output">{value}:{changes}:{composing}</output>

<ZButton data-testid="textarea-production-toggle" onclick={() => (hidden = !hidden)} type="button">
	Toggle hidden autosize
</ZButton>
<ZBox {hidden} style="max-width: 16rem">
	<ZTextarea
		autosize={{ minRows: 1, maxRows: 3 }}
		data-testid="textarea-production-hidden"
		defaultValue="A long hidden value that wraps after the control becomes visible."
	/>
</ZBox>

<ZField label="Readonly" readonly>
	<ZTextarea data-testid="textarea-production-readonly" defaultValue="Immutable" />
</ZField>
<ZField disabled label="Disabled">
	<ZTextarea data-testid="textarea-production-disabled" defaultValue="Unavailable" />
</ZField>
