<script lang="ts">
	import type { StandardSchemaV1 } from '@standard-schema/spec';
	import { tick } from 'svelte';
	import ZForm, {
		type FormState,
		type FormValidationResult,
		type ZFormController
	} from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZInput from '../src/components/input/ZInput.svelte';
	import { createFormModel, type FormModel } from '../src/runtime/form/form-model.svelte.js';
	import type { FormFieldState } from '../src/runtime/form/form-registry.svelte.js';

	interface Values {
		name: string;
		other: string;
	}

	interface PendingValidation {
		readonly input: Values;
		readonly resolve: (result: StandardSchemaV1.Result<Values>) => void;
	}

	const firstModel = createFormModel<Values>({
		defaultValues: { name: 'Ada', other: 'one' }
	});
	const secondModel = createFormModel<Values>({
		defaultValues: { name: 'New owner', other: 'two' }
	});
	let activeModel = $state<FormModel<Values>>(firstModel);
	let controller = $state<ZFormController<Values, Values> | null>(null);
	let formDisabled = $state(false);
	let formRef = $state<HTMLFormElement | null>(null);
	let formReadonly = $state(false);
	let deferValidation = false;
	let pendingValidations = $state.raw<PendingValidation[]>([]);
	let pendingSubmit:
		{ readonly reject: (error: unknown) => void; readonly resolve: () => void } | undefined;
	let submitCalls = $state(0);
	let submitErrors = $state(0);
	let submitting = $state(false);
	let preventReset = $state(false);
	let validationResult = $state('none');
	let formStates = $state<readonly FormState[]>([]);
	let subscribedFormStates = $state<readonly FormState[]>([]);
	let fieldStates = $state<readonly FormFieldState[]>([]);
	let subscribedFieldStates = $state<readonly FormFieldState[]>([]);
	const rejectedOwner = $state({ name: 'Owner value' });
	const rejectedModel = createFormModel({
		defaultValues: { name: 'Rejected baseline' },
		read: () => rejectedOwner,
		write: () => undefined
	});
	let rejectedController = $state<ZFormController<{ name: string }, { name: string }> | null>(null);

	const schema: StandardSchemaV1<Values, Values> = {
		'~standard': {
			version: 1,
			vendor: 'zui-form-core-integration',
			validate(input) {
				const values = input as Values;
				if (deferValidation) {
					deferValidation = false;
					return new Promise((resolve) => {
						pendingValidations = [...pendingValidations, { input: values, resolve }];
					});
				}
				return values.name === 'schema'
					? { issues: [{ message: 'Schema error', path: ['name'] }] }
					: { value: values };
			}
		}
	};

	$effect(() => {
		const current = controller;
		if (!current) return;
		const stopState = current.subscribeState((state) => {
			subscribedFormStates = [...subscribedFormStates, state];
		});
		const stopField = current.subscribeField('name', (state) => {
			subscribedFieldStates = [...subscribedFieldStates, state];
		});
		return () => {
			stopState();
			stopField();
		};
	});

	function summarizeField(state: FormFieldState | undefined): string {
		return state
			? `${state.dirty}:${state.touched}:${state.validating}:${state.errors.join('+')}:${state.warnings.join('+')}:${state.success ?? ''}`
			: 'none';
	}

	export function setServerErrors(): void {
		controller?.setErrors({ name: ['Server error'], other: ['Other server'] });
	}

	export function setManualFeedback(): void {
		controller?.setFieldFeedback('name', {
			errors: ['Manual error'],
			success: 'Temporary success',
			warnings: ['Manual warning']
		});
	}

	export function clearNameErrors(): void {
		controller?.clearErrors(['name']);
	}

	export function clearAllErrors(): void {
		controller?.clearErrors();
	}

	export function clearObservations(): void {
		formStates = [];
		subscribedFormStates = [];
		fieldStates = [];
		subscribedFieldStates = [];
	}

	export async function addSchemaError(): Promise<void> {
		firstModel.setField('name', 'schema');
		await controller?.validate();
	}

	export function initializeKeepDirty(): void {
		controller?.initialize({ name: 'Initialized', other: 'fresh' }, { keepDirtyValues: true });
	}

	export function initializeReplace(): void {
		controller?.initialize({ name: 'Baseline', other: 'base' });
	}

	export function changeNameThroughController(): void {
		controller?.setFieldValue('name', 'Changed');
	}

	export function resetName(): void {
		controller?.resetField('name');
	}

	export function setFormDisabled(next: boolean): void {
		formDisabled = next;
	}

	export function setFormReadonly(next: boolean): void {
		formReadonly = next;
	}

	export function setPreventReset(next: boolean): void {
		preventReset = next;
	}

	export function setRejectedFeedback(): void {
		rejectedController?.setFieldFeedback('name', {
			errors: ['Rejected error'],
			warnings: ['Rejected warning']
		});
	}

	export function resetRejectedName(): void {
		rejectedController?.resetField('name');
	}

	export async function batchAndValidate(): Promise<void> {
		controller?.setValues({ name: 'Batch', other: 'Fresh' });
		await tick();
		const result = await controller?.validate();
		const data = result?.data;
		const formData = formRef ? new FormData(formRef) : new FormData();
		validationResult = `${data?.name}:${data?.other}:${formData.get('name')}:${formData.get('other')}`;
	}

	export function deferNextValidation(): void {
		deferValidation = true;
	}

	export function startValidation(): Promise<FormValidationResult<Values>> | undefined {
		return controller?.validate();
	}

	export function switchModel(): void {
		activeModel = secondModel;
	}

	export function resolveOldValidationWithError(): void {
		const [pending, ...remaining] = pendingValidations;
		pendingValidations = remaining;
		pending?.resolve({ issues: [{ message: 'Late old error', path: ['name'] }] });
	}

	export function resolveSubmit(): void {
		pendingSubmit?.resolve();
		pendingSubmit = undefined;
	}

	export function rejectSubmit(): void {
		pendingSubmit?.reject(new Error('Submit rejected'));
		pendingSubmit = undefined;
	}

	export async function flush(): Promise<void> {
		await tick();
	}
</script>

<ZForm
	bind:controller
	bind:ref={formRef}
	bind:submitting
	clearServerErrorsOnChange={false}
	disabled={formDisabled}
	model={activeModel}
	readonly={formReadonly}
	{schema}
	data-testid="form-core"
	nativeValidation
	onreset={(event) => {
		if (preventReset) event.preventDefault();
	}}
	onStateChange={(state) => (formStates = [...formStates, state])}
	onSubmitError={() => (submitErrors += 1)}
	onValidSubmit={() => {
		submitCalls += 1;
		return new Promise<void>((resolve, reject) => {
			pendingSubmit = { reject, resolve };
		});
	}}
>
	<ZFormField
		disabled={false}
		name="name"
		label="Name"
		onStateChange={(state) => (fieldStates = [...fieldStates, state])}
		readonly={false}
	>
		<ZInput data-testid="form-core-name" required />
	</ZFormField>
	<ZFormField disabled={false} name="other" label="Other" readonly={false}>
		<ZInput data-testid="form-core-other" />
	</ZFormField>
	<button type="submit">Submit core form</button>
	<button type="reset">Reset core form</button>
</ZForm>

<ZForm bind:controller={rejectedController} model={rejectedModel} data-testid="form-core-rejected">
	<ZFormField name="name" label="Rejected name">
		<ZInput data-testid="form-core-rejected-name" />
	</ZFormField>
</ZForm>

<output data-testid="form-core-errors">{JSON.stringify(controller?.getState().errors ?? {})}</output
>
<output data-testid="form-core-state"
	>{controller?.getState().dirty ?? false}:{controller?.getState().touched ??
		false}:{controller?.getState().valid ?? true}:{submitting}</output
>
<output data-testid="form-core-field">{summarizeField(controller?.getFieldState('name'))}</output>
<output data-testid="form-core-observers"
	>{formStates.length}:{subscribedFormStates.length}:{fieldStates.length}:{subscribedFieldStates.length}|{summarizeField(
		fieldStates.at(-1)
	)}|{summarizeField(subscribedFieldStates.at(-1))}</output
>
<output data-testid="form-core-submit">{submitCalls}:{submitErrors}:{submitting}</output>
<output data-testid="form-core-validation">{validationResult}</output>
<output data-testid="form-core-pending">{pendingValidations.length}</output>
<output data-testid="form-core-rejected-field"
	>{summarizeField(rejectedController?.getFieldState('name'))}</output
>
