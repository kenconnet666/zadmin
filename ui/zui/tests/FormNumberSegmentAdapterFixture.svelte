<script lang="ts">
	import ZForm, { type ZFormController } from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZNumberField from '../src/components/input/ZNumberField.svelte';
	import ZSegmented from '../src/components/input/ZSegmented.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';
	type Mode = 1 | '1';
	interface Values {
		amount: number | null | undefined;
		mode: Mode | null | undefined;
	}
	const defaults: Values = { amount: 12.5, mode: 1 };
	let owner = $state<Values>({ ...defaults });
	let controller = $state<ZFormController<Values, Values> | null>(null);
	let userChanges = $state(0);
	const model = createFormModel({
		defaultValues: defaults,
		read: () => owner,
		write: (next) => (owner = { ...next })
	});
	const rejectedOwner = $state<Values>({ amount: 7, mode: '1' });
	const rejected = createFormModel({
		defaultValues: rejectedOwner,
		read: () => rejectedOwner,
		write: () => undefined
	});
	export function updateController(): void {
		controller?.setFieldValue('amount', null);
		controller?.setFieldValue('mode', '1');
	}
	export const validate = () => controller!.validate();
	export const getState = () => controller!.getState();
	export const resetAmount = () => controller!.resetField('amount');
</script>

<ZForm bind:controller {model} data-testid="number-segment-form">
	<ZFormField name="amount" label="Amount"
		><ZNumberField
			data-testid="model-number"
			precision={1}
			onValueChange={() => (userChanges += 1)}
		/></ZFormField
	>
	<ZFormField name="mode" label="Mode"
		><ZSegmented
			data-testid="model-segmented"
			options={[
				{ label: 'Number one', value: 1 },
				{ label: 'String one', value: '1' }
			]}
			onValueChange={() => (userChanges += 1)}
		/></ZFormField
	>
	<button type="reset">Reset</button>
</ZForm>
<output data-testid="number-segment-values"
	>{String(owner.amount)}|{String(owner.mode)}|{typeof owner.mode}|{userChanges}</output
>
<ZForm model={rejected} data-testid="number-segment-rejected">
	<ZFormField name="amount" label="Rejected amount"
		><ZNumberField data-testid="rejected-number" /></ZFormField
	>
	<ZFormField name="mode" label="Rejected mode"
		><ZSegmented
			data-testid="rejected-segmented"
			options={[
				{ label: 'Number one', value: 1 },
				{ label: 'String one', value: '1' }
			]}
		/></ZFormField
	>
	<button type="reset">Reset rejected</button>
</ZForm>
