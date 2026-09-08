<script lang="ts">
	import type { StandardSchemaV1 } from '@standard-schema/spec';
	import { untrack } from 'svelte';
	import ZForm, { type ZFormController } from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZFormList, { type FormListOperations } from '../src/components/input/ZFormList.svelte';
	import type { FormArrayRow } from '../src/runtime/form/form-array.svelte.js';
	import ZInput from '../src/components/input/ZInput.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';

	interface Member {
		readonly name?: string;
	}
	interface Group {
		readonly key: string;
		readonly members: readonly Member[];
	}
	interface Values {
		readonly groups: readonly Group[];
	}

	function baselineValues(): Values {
		return {
			groups: [
				{ key: 'a', members: [{ name: 'a-one' }, { name: 'a-two' }] },
				{ key: 'b', members: [{ name: 'b-one' }, { name: 'b-two' }] }
			]
		};
	}

	let owner = $state<Values>(baselineValues());
	// The controlled owner changes, but reset must retain this fixture's original nested baseline.
	const initialValues = untrack(() => owner);
	const model = createFormModel<Values>({
		defaultValues: initialValues,
		read: () => owner,
		write: (next) => (owner = next)
	});
	let controller = $state<ZFormController<Values, Values> | null>(null);
	let outerOperation = $state('none');
	let innerOperation = $state('none');
	let resolveValidation: (() => void) | undefined;
	let signalValidationStarted: (() => void) | undefined;
	let validationStarted = Promise.resolve();
	let validationPromise: ReturnType<NonNullable<typeof controller>['validate']> | undefined;
	const schema: StandardSchemaV1<Values, Values> = {
		'~standard': {
			version: 1,
			vendor: 'nested-form-list-test',
			validate: async () => {
				signalValidationStarted?.();
				await new Promise<void>((resolve) => (resolveValidation = resolve));
				return {
					issues: [
						{
							message: 'Late removed member error',
							path: ['groups', 0, 'members', 0, 'name']
						}
					]
				};
			}
		}
	};

	export function seedNestedErrors(): void {
		controller?.setErrors({
			'groups[0].members[0].name': ['Server a-one']
		});
		controller?.setFieldFeedback(['groups', 0, 'members', 0, 'name'], {
			errors: ['Manual a-one'],
			warnings: ['Manual warning a-one']
		});
	}
	export function fieldState(groupIndex: number, memberIndex: number) {
		return controller?.getFieldState(['groups', groupIndex, 'members', memberIndex, 'name']);
	}
	export function fieldValue(groupIndex: number, memberIndex: number): unknown {
		return controller?.getFieldValue(['groups', groupIndex, 'members', memberIndex, 'name']);
	}
	export function setMemberName(groupIndex: number, memberIndex: number, name: string): boolean {
		return (
			controller?.setFieldValue(['groups', groupIndex, 'members', memberIndex, 'name'], name) ??
			false
		);
	}
	export function resetMember(groupIndex: number, memberIndex: number): void {
		controller?.resetField(['groups', groupIndex, 'members', memberIndex, 'name']);
	}
	export function initializeSameBaseline(): void {
		controller?.initialize(baselineValues());
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

	let rejectedOwner = $state<Values>({
		groups: [
			{ key: 'fixed-a', members: [{ name: 'fixed-a-one' }, { name: 'fixed-a-two' }] },
			{ key: 'fixed-b', members: [{ name: 'fixed-b-one' }] }
		]
	});
	const rejectedModel = createFormModel<Values>({
		defaultValues: rejectedOwner,
		read: () => rejectedOwner,
		write: () => undefined
	});
	let rejectedController = $state<ZFormController<Values, Values> | null>(null);
	let rejectedOperation = $state('none');
	export function seedRejectedErrors(): void {
		rejectedController?.setErrors({
			'groups[0].members[0].name': ['Rejected server']
		});
		rejectedController?.setFieldFeedback(['groups', 0, 'members', 0, 'name'], {
			errors: ['Rejected manual'],
			warnings: ['Rejected warning']
		});
	}
	export function rejectedState() {
		return rejectedController?.getFieldState(['groups', 0, 'members', 0, 'name']);
	}
</script>

<ZForm bind:controller {model} {schema} data-testid="nested-list-form">
	<ZFormList name="groups" data-testid="outer-list">
		{#snippet children(
			groups: readonly FormArrayRow<Group>[],
			outerOperations: FormListOperations<Group>
		)}
			{#each groups as group (group.id)}
				<section data-main-group-id={group.id} data-group-key={group.value.key}>
					<ZFormList name={[...group.path, 'members']} data-members-for={group.value.key}>
						{#snippet children(members, memberOperations)}
							{#each members as member (member.id)}
								<div data-main-member-id={member.id}>
									<ZFormField
										name={[...member.path, 'name']}
										label={`${group.value.key} member ${member.index}`}
									>
										<ZInput data-member-input={member.id} />
									</ZFormField>
								</div>
							{/each}
							<button
								type="button"
								data-inner-move={group.value.key}
								onclick={() => (innerOperation = String(memberOperations.move(0, 1)))}
								>Move members</button
							>
							<button
								type="button"
								data-inner-append={group.value.key}
								onclick={() =>
									(innerOperation = String(memberOperations.append({ name: 'draft-member' })))}
								>Append member</button
							>
						{/snippet}
					</ZFormList>
					<button
						type="button"
						data-outer-remove={group.value.key}
						onclick={() => (outerOperation = String(outerOperations.remove(group.index)))}
						>Remove group</button
					>
				</section>
			{/each}
			<button
				type="button"
				data-testid="outer-swap"
				onclick={() => (outerOperation = String(outerOperations.move(0, 1)))}>Swap groups</button
			>
			<button
				type="button"
				data-testid="outer-append"
				onclick={() =>
					(outerOperation = String(outerOperations.append({ key: 'draft', members: [] })))}
				>Append group</button
			>
		{/snippet}
	</ZFormList>
	<button type="reset">Reset nested form</button>
</ZForm>
<output data-testid="nested-outer-operation">{outerOperation}</output>
<output data-testid="nested-inner-operation">{innerOperation}</output>
<output data-testid="nested-values">{JSON.stringify(owner)}</output>

<ZForm
	bind:controller={rejectedController}
	model={rejectedModel}
	data-testid="rejected-nested-form"
>
	<ZFormList name="groups" data-testid="rejected-outer-list">
		{#snippet children(
			groups: readonly FormArrayRow<Group>[],
			outerOperations: FormListOperations<Group>
		)}
			{#each groups as group (group.id)}
				<section data-rejected-group-id={group.id} data-rejected-group-key={group.value.key}>
					<ZFormList name={[...group.path, 'members']}>
						{#snippet children(members)}
							{#each members as member (member.id)}
								<div data-rejected-member-id={member.id}>
									<ZFormField
										name={[...member.path, 'name']}
										label={`${group.value.key} member ${member.index}`}
									>
										<ZInput data-rejected-member-input={member.id} />
									</ZFormField>
								</div>
							{/each}
						{/snippet}
					</ZFormList>
				</section>
			{/each}
			<button
				type="button"
				data-testid="rejected-outer-remove"
				onclick={() => (rejectedOperation = String(outerOperations.remove(0)))}
				>Reject outer remove</button
			>
		{/snippet}
	</ZFormList>
</ZForm>
<output data-testid="rejected-nested-operation">{rejectedOperation}</output>
<output data-testid="rejected-nested-values">{JSON.stringify(rejectedOwner)}</output>
