<script lang="ts">
	import ZCheckboxGroup from '../src/components/compound/checkbox-group/ZCheckboxGroup.svelte';
	import ZCheckbox from '../src/components/input/ZCheckbox.svelte';
	import ZForm from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZInput from '../src/components/input/ZInput.svelte';
	import ZNativeSelect from '../src/components/input/ZNativeSelect.svelte';
	import ZTextarea from '../src/components/input/ZTextarea.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';

	type Kind = 'checkbox' | 'conflict' | 'group' | 'input' | 'select' | 'textarea';
	let { kind }: { kind: Kind } = $props();
	const model = createFormModel({ defaultValues: { value: 42 as unknown } });
</script>

<ZForm {model}>
	<ZFormField name="value" label="Invalid model value">
		{#if kind === 'checkbox'}
			<ZCheckbox aria-label="Invalid checkbox" />
		{:else if kind === 'group'}
			<ZCheckboxGroup aria-label="Invalid group" options={[]} />
		{:else if kind === 'select'}
			<ZNativeSelect aria-label="Invalid select" items={[{ label: 'One', value: 'one' }]} />
		{:else if kind === 'textarea'}
			<ZTextarea aria-label="Invalid textarea" />
		{:else if kind === 'conflict'}
			<ZInput aria-label="Conflicting input" value="controlled" />
		{:else}
			<ZInput aria-label="Invalid input" />
		{/if}
	</ZFormField>
</ZForm>
