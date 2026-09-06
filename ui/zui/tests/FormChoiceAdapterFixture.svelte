<script lang="ts">
	import ZRadioGroup from '../src/components/compound/radio-group/ZRadioGroup.svelte';
	import ZForm, { type ZFormController } from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZSwitch from '../src/components/input/ZSwitch.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';

	interface ChoiceValues {
		choice: number | undefined;
		enabled: boolean | undefined;
		external: boolean | undefined;
	}

	const defaults: ChoiceValues = { choice: 1, enabled: true, external: true };
	let owner = $state<ChoiceValues>({ ...defaults });
	let controller = $state<ZFormController<ChoiceValues, ChoiceValues> | null>(null);
	let modelChanges = $state(0);
	let controlChanges = $state(0);
	let controlsDisabled = $state(false);
	let controlsReadonly = $state(false);
	const model = createFormModel<ChoiceValues>({
		defaultValues: defaults,
		onValuesChange: () => (modelChanges += 1),
		read: () => owner,
		write: (next) => (owner = { ...next })
	});

	const rejectedOwner = $state({ choice: 1 as number | undefined, enabled: true });
	const rejectedModel = createFormModel({
		defaultValues: { choice: 2 as number | undefined, enabled: false },
		read: () => rejectedOwner,
		write: () => undefined
	});

	export function setReadonly(next: boolean): void {
		controlsReadonly = next;
	}

	export function setDisabled(next: boolean): void {
		controlsDisabled = next;
	}

	export function mutateExternal(): void {
		owner.enabled = false;
		owner.choice = 2;
	}

	export function clearChoices(): void {
		controller?.setFieldValue('enabled', undefined);
		controller?.setFieldValue('choice', undefined);
	}
</script>

<form id="choice-external-form" data-testid="choice-external-form"></form>

<ZProvider direction="rtl">
	<ZForm bind:controller {model} data-testid="choice-form" nativeValidation>
		<ZFormField name="enabled" label="Enabled" size="large">
			<ZSwitch
				aria-label="Enabled"
				data-testid="choice-switch"
				disabled={controlsDisabled}
				onCheckedChange={() => (controlChanges += 1)}
				readonly={controlsReadonly}
				value="yes"
			/>
		</ZFormField>
		<ZFormField name="choice" label="Choice" required size="large">
			<ZRadioGroup
				data-testid="choice-radio"
				disabled={controlsDisabled}
				onValueChange={() => (controlChanges += 1)}
				options={[
					{ label: 'One', value: 1 },
					{ label: 'Two', value: 2 }
				]}
				orientation="horizontal"
				readonly={controlsReadonly}
			/>
		</ZFormField>
		<ZFormField name="external" label="External switch">
			<ZSwitch
				aria-label="External switch"
				data-testid="choice-external-switch"
				form="choice-external-form"
				onCheckedChange={() => (controlChanges += 1)}
				value="external-on"
			/>
		</ZFormField>
		<button type="reset">Reset choices</button>
	</ZForm>
</ZProvider>

<ZForm model={rejectedModel} data-testid="choice-rejected-form">
	<ZFormField name="enabled" label="Rejected switch">
		<ZSwitch aria-label="Rejected switch" data-testid="choice-rejected-switch" />
	</ZFormField>
	<ZFormField name="choice" label="Rejected radio">
		<ZRadioGroup
			aria-label="Rejected radio"
			data-testid="choice-rejected-radio"
			options={[
				{ label: 'Rejected one', value: 1 },
				{ label: 'Rejected two', value: 2 }
			]}
		/>
	</ZFormField>
	<button type="reset">Reset rejected choices</button>
</ZForm>

<output data-testid="choice-values"
	>{String(owner.enabled)}:{String(owner.choice)}:{String(owner.external)}</output
>
<output data-testid="choice-counts">{modelChanges}:{controlChanges}</output>
