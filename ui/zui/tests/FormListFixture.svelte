<script lang="ts">
	import type { StandardSchemaV1 } from '@standard-schema/spec';
	import ZForm, { type ZFormController } from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZFormList from '../src/components/input/ZFormList.svelte';
	import ZInput from '../src/components/input/ZInput.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';
	interface Row {
		name: string;
	}
	interface Values {
		preserved: string;
		users: readonly Row[];
	}
	let { native = false }: { native?: boolean } = $props();
	let owner = $state<Values>({ preserved: 'keep', users: [{ name: 'same' }, { name: 'same' }] });
	const model = createFormModel({
		defaultValues: owner,
		read: () => owner,
		write: (next) => (owner = next)
	});
	let readonly = $state(false);
	let controller = $state<ZFormController<Values, Values> | null>(null);
	let lastOperation = $state('none');
	let showPreserved = $state(true);
	let resolveValidation: (() => void) | undefined;
	let signalValidationStarted: (() => void) | undefined;
	let validationStarted = Promise.resolve();
	let validationPromise: ReturnType<NonNullable<typeof controller>['validate']> | undefined;
	const schema: StandardSchemaV1<Values, Values> = {
		'~standard': {
			version: 1,
			vendor: 'form-list-test',
			validate: async (_value) => {
				signalValidationStarted?.();
				await new Promise<void>((resolve) => (resolveValidation = resolve));
				return { issues: [{ message: 'Late row error', path: ['users', 0, 'name'] }] };
			}
		}
	};
	const rejectedOwner = $state({ users: [{ name: 'fixed-a' }, { name: 'fixed-b' }] });
	const rejectedModel = createFormModel({
		defaultValues: rejectedOwner,
		read: () => rejectedOwner,
		write: () => undefined
	});
	let rejectedResult = $state('none');
	let rejectedController = $state<ZFormController<
		typeof rejectedOwner,
		typeof rejectedOwner
	> | null>(null);
	export function setReadonly(value: boolean): void {
		readonly = value;
	}
	export function seedState(): void {
		controller?.setErrors({ 'users[0].name': ['Server row zero'] });
		controller?.setFieldFeedback(['users', 0, 'name'], { warnings: ['Manual row zero'] });
	}
	export function fieldState(index: number) {
		return controller?.getFieldState(['users', index, 'name']);
	}
	export function formState() {
		return controller?.getState();
	}
	export function startValidation(): void {
		validationStarted = new Promise<void>((resolve) => (signalValidationStarted = resolve));
		validationPromise = controller?.validate();
	}
	export function waitValidationStarted(): Promise<void> {
		return validationStarted;
	}
	export async function finishValidation() {
		resolveValidation?.();
		return validationPromise;
	}
	export function togglePreserved(): void {
		showPreserved = !showPreserved;
	}
	export function seedPreserved(): void {
		controller?.setFieldFeedback('preserved', { warnings: ['Keep warning'] });
	}
	export function preservedState() {
		return controller?.getFieldState('preserved');
	}
	export function preservedValue() {
		return model.get('preserved');
	}
	export function seedRejectedState(): void {
		rejectedController?.setErrors({ 'users[0].name': ['Rejected server'] });
		rejectedController?.setFieldFeedback(['users', 0, 'name'], { warnings: ['Rejected warning'] });
	}
	export function rejectedState() {
		return rejectedController?.getFieldState(['users', 0, 'name']);
	}
</script>

<ZForm
	bind:controller
	model={native ? undefined : model}
	{readonly}
	{schema}
	data-testid="list-form"
>
	<ZFormList name="users" data-testid="form-list">
		{#snippet children(rows, operations)}
			{#each rows as row (row.id)}
				<div data-row-id={row.id}>
					<ZFormField name={[...row.path, 'name']} label={'User ' + row.index}>
						<ZInput data-testid={'row-input-' + row.id} />
					</ZFormField>
					<button type="button" data-remove={row.id} onclick={() => operations.remove(row.index)}
						>Remove</button
					>
				</div>
			{/each}
			<button
				type="button"
				data-testid="move-rows"
				onclick={() => (lastOperation = String(operations.move(0, 1)))}>Move</button
			>
			<button
				type="button"
				data-testid="append-row"
				onclick={() => (lastOperation = String(operations.append({ name: 'new' })))}>Append</button
			>
		{/snippet}
	</ZFormList>
	{#if showPreserved}
		<ZFormField name="preserved" label="Preserved" preserve>
			<ZInput data-testid="preserved-input" />
		</ZFormField>
	{/if}
	<button type="reset">Reset</button>
</ZForm>
<output data-testid="list-values">{owner.users.map((row) => row.name).join(',')}</output>
<output data-testid="list-operation">{lastOperation}</output>

<ZForm bind:controller={rejectedController} model={rejectedModel} data-testid="rejected-list-form">
	<ZFormList name="users" data-testid="rejected-list">
		{#snippet children(rows, operations)}
			{#each rows as row (row.id)}
				<div data-rejected-row={row.id}>
					<ZFormField name={[...row.path, 'name']} label={'Rejected ' + row.index}>
						<ZInput data-testid={'rejected-input-' + row.id} />
					</ZFormField>
				</div>
			{/each}
			<button
				type="button"
				data-testid="rejected-remove"
				onclick={() => (rejectedResult = String(operations.remove(0)))}>Reject remove</button
			>
		{/snippet}
	</ZFormList>
</ZForm>
<output data-testid="rejected-result">{rejectedResult}</output>
