<script lang="ts">
	import type { StandardSchemaV1 } from '@standard-schema/spec';
	import ZCheckboxGroup from '../src/components/compound/checkbox-group/ZCheckboxGroup.svelte';
	import ZCheckbox from '../src/components/input/ZCheckbox.svelte';
	import ZForm, {
		type FormSubmitDetail,
		type ZFormController
	} from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZInput from '../src/components/input/ZInput.svelte';
	import ZNativeSelect from '../src/components/input/ZNativeSelect.svelte';
	import ZPasswordInput from '../src/components/input/ZPasswordInput.svelte';
	import ZTextarea from '../src/components/input/ZTextarea.svelte';
	import { createFormModel, type FormValuesChange } from '../src/runtime/form/form-model.svelte.js';

	interface AdapterValues {
		active: boolean | undefined;
		external: string | undefined;
		name: string | undefined;
		notes: string | undefined;
		password: string | undefined;
		permissions: readonly string[] | undefined;
		role: string | undefined;
	}

	const defaults: AdapterValues = {
		active: true,
		external: 'outside',
		name: 'Ada',
		notes: 'Initial notes',
		password: 'secret',
		permissions: ['read'],
		role: 'editor'
	};
	let owner = $state<AdapterValues>({ ...defaults });
	let modelChanges = $state<readonly FormValuesChange<AdapterValues>[]>([]);
	let controlChanges = $state(0);
	let submitted = $state('none');
	let controller = $state<ZFormController<AdapterValues, AdapterValues> | null>(null);
	const model = createFormModel<AdapterValues>({
		defaultValues: defaults,
		onValuesChange(detail) {
			modelChanges = [...modelChanges, detail];
		},
		read: () => owner,
		write(next) {
			owner = { ...next, permissions: next.permissions ? [...next.permissions] : undefined };
		}
	});
	const schema: StandardSchemaV1<AdapterValues, AdapterValues> = {
		'~standard': {
			version: 1,
			vendor: 'zui-form-control-adapter-test',
			validate(input) {
				const values = input as AdapterValues;
				return typeof values.name === 'string' && values.name.length > 0
					? { value: values }
					: { issues: [{ message: 'Name required', path: ['name'] }] };
			}
		}
	};

	const rejectedOwner = $state({ value: 'fixed' });
	const rejectedModel = createFormModel({
		defaultValues: { value: 'fixed' },
		read: () => rejectedOwner,
		write: () => undefined
	});

	export function mutateExternalName(): void {
		owner.name = 'Grace';
	}

	export function clearThroughController(): void {
		controller?.setFieldValue('name', undefined);
		controller?.setFieldValue('notes', undefined);
		controller?.setFieldValue('active', undefined);
		controller?.setFieldValue('role', undefined);
		controller?.setFieldValue('permissions', undefined);
	}

	export function setNameThroughController(): void {
		controller?.setFieldValue('name', 'Lin');
	}
</script>

<form id="adapter-external-form" data-testid="adapter-external-form"></form>

<ZForm
	bind:controller
	{model}
	{schema}
	data-testid="adapter-form"
	onValidSubmit={(detail: FormSubmitDetail<AdapterValues>) =>
		(submitted = `${detail.data.name}:${detail.formData.get('name')}`)}
>
	<ZFormField name="name" label="Name">
		<ZInput data-testid="adapter-input" onValueChange={() => (controlChanges += 1)} />
	</ZFormField>
	<ZFormField name="notes" label="Notes">
		<ZTextarea data-testid="adapter-textarea" onValueChange={() => (controlChanges += 1)} />
	</ZFormField>
	<ZFormField name="active" label="Active">
		<label>
			<ZCheckbox
				aria-label="Active"
				data-testid="adapter-checkbox"
				onCheckedChange={() => (controlChanges += 1)}
				value="yes"
			/>
			Active
		</label>
	</ZFormField>
	<ZFormField name="role" label="Role">
		<ZNativeSelect
			data-testid="adapter-select"
			items={[
				{ label: 'No role', value: '' },
				{ label: 'Editor', value: 'editor' },
				{ label: 'Admin', value: 'admin' }
			]}
			onValueChange={() => (controlChanges += 1)}
		/>
	</ZFormField>
	<ZFormField name="permissions" label="Permissions">
		<ZCheckboxGroup
			data-testid="adapter-group"
			onValueChange={() => (controlChanges += 1)}
			options={[
				{ label: 'Read', value: 'read' },
				{ label: 'Write', value: 'write' }
			]}
		/>
	</ZFormField>
	<ZFormField name="password" label="Password">
		<ZPasswordInput data-testid="adapter-password" onValueChange={() => (controlChanges += 1)} />
	</ZFormField>
	<ZFormField name="external" label="External form value">
		<ZInput
			data-testid="adapter-external"
			form="adapter-external-form"
			onValueChange={() => (controlChanges += 1)}
		/>
	</ZFormField>
	<button type="submit">Submit adapter form</button>
	<button type="reset">Reset adapter form</button>
</ZForm>

<ZForm model={rejectedModel} data-testid="adapter-rejected-form">
	<ZFormField name="value" label="Rejected value">
		<ZInput data-testid="adapter-rejected" />
	</ZFormField>
	<button type="reset">Reset rejected form</button>
</ZForm>

<output data-testid="adapter-values"
	>{owner.name ?? 'undefined'}|{owner.notes ?? 'undefined'}|{String(owner.active)}|{owner.role ??
		'undefined'}|{owner.permissions?.join(',') ?? 'undefined'}|{owner.password ??
		'undefined'}|{owner.external ?? 'undefined'}</output
>
<output data-testid="adapter-counts">{modelChanges.length}:{controlChanges}</output>
<output data-testid="adapter-submitted">{submitted}</output>
