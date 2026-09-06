<script lang="ts">
	import ZMultiSelect from '../src/components/compound/multi-select/ZMultiSelect.svelte';
	import ZMultiSelectContent from '../src/components/compound/multi-select/ZMultiSelectContent.svelte';
	import ZMultiSelectItem from '../src/components/compound/multi-select/ZMultiSelectItem.svelte';
	import ZMultiSelectTrigger from '../src/components/compound/multi-select/ZMultiSelectTrigger.svelte';
	import ZSelect from '../src/components/compound/select/ZSelect.svelte';
	import ZSelectContent from '../src/components/compound/select/ZSelectContent.svelte';
	import ZSelectItem from '../src/components/compound/select/ZSelectItem.svelte';
	import ZSelectTrigger from '../src/components/compound/select/ZSelectTrigger.svelte';
	import ZForm, { type ZFormController } from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZTagsInput from '../src/components/input/ZTagsInput.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';

	interface CollectionValues {
		scopes: readonly string[] | undefined;
		tags: readonly string[] | undefined;
		target: string | undefined;
	}

	const defaults: CollectionValues = {
		scopes: ['read'],
		tags: ['alpha'],
		target: 'b'
	};
	let owner = $state<CollectionValues>({
		...defaults,
		scopes: [...defaults.scopes!],
		tags: [...defaults.tags!]
	});
	let controller = $state<ZFormController<CollectionValues, CollectionValues> | null>(null);
	let modelChanges = $state(0);
	let controlChanges = $state(0);
	let controlsDisabled = $state(false);
	let controlsReadonly = $state(false);
	const model = createFormModel<CollectionValues>({
		defaultValues: defaults,
		onValuesChange: () => (modelChanges += 1),
		read: () => owner,
		write(next) {
			owner = {
				...next,
				scopes: next.scopes ? [...next.scopes] : undefined,
				tags: next.tags ? [...next.tags] : undefined
			};
		}
	});

	const rejectedOwner = $state<CollectionValues>({
		scopes: ['read'],
		tags: ['alpha'],
		target: 'b'
	});
	const rejectedModel = createFormModel<CollectionValues>({
		defaultValues: { scopes: ['write'], tags: ['reset'], target: 'a' },
		read: () => rejectedOwner,
		write: () => undefined
	});

	export function mutateExternal(): void {
		owner.tags = ['external'];
		owner.target = 'a';
		owner.scopes = ['write'];
	}

	export function clearThroughController(): void {
		controller?.setFieldValue('tags', undefined);
		controller?.setFieldValue('target', undefined);
		controller?.setFieldValue('scopes', undefined);
	}

	export function setReadonly(next: boolean): void {
		controlsReadonly = next;
	}

	export function setDisabled(next: boolean): void {
		controlsDisabled = next;
	}

	export async function validateOwners(): Promise<boolean> {
		return (await controller?.validate())?.valid ?? false;
	}
</script>

<ZProvider direction="rtl">
	<ZForm bind:controller {model} data-testid="collection-form">
		<ZFormField name="tags" label="Tags">
			<ZTagsInput
				addLabel="Add tag"
				data-testid="collection-tags"
				disabled={controlsDisabled}
				onValueChange={() => (controlChanges += 1)}
				readonly={controlsReadonly}
			/>
		</ZFormField>
		<ZFormField name="target" label="Target">
			<ZSelect
				disabled={controlsDisabled}
				onValueChange={() => (controlChanges += 1)}
				readonly={controlsReadonly}
			>
				<ZSelectTrigger aria-label="Target" data-testid="collection-select-trigger" />
				<ZSelectContent data-testid="collection-select-content">
					<ZSelectItem data-testid="collection-select-a" value="a">Alpha</ZSelectItem>
					<ZSelectItem data-testid="collection-select-b" value="b">Beta</ZSelectItem>
				</ZSelectContent>
			</ZSelect>
		</ZFormField>
		<ZFormField name="scopes" label="Scopes">
			<ZMultiSelect
				clearable
				disabled={controlsDisabled}
				onValueChange={() => (controlChanges += 1)}
				readonly={controlsReadonly}
			>
				<ZMultiSelectTrigger aria-label="Scopes" data-testid="collection-multi-trigger" />
				<ZMultiSelectContent data-testid="collection-multi-content">
					<ZMultiSelectItem data-testid="collection-multi-read" value="read">Read</ZMultiSelectItem>
					<ZMultiSelectItem data-testid="collection-multi-write" value="write"
						>Write</ZMultiSelectItem
					>
				</ZMultiSelectContent>
			</ZMultiSelect>
		</ZFormField>
		<button type="reset">Reset collection controls</button>
	</ZForm>

	<ZForm model={rejectedModel} data-testid="collection-rejected-form">
		<ZFormField name="tags" label="Rejected tags">
			<ZTagsInput addLabel="Add rejected tag" data-testid="rejected-tags" />
		</ZFormField>
		<ZFormField name="target" label="Rejected target">
			<ZSelect>
				<ZSelectTrigger aria-label="Rejected target" data-testid="rejected-select-trigger" />
				<ZSelectContent>
					<ZSelectItem data-testid="rejected-select-a" value="a">Rejected Alpha</ZSelectItem>
					<ZSelectItem data-testid="rejected-select-b" value="b">Rejected Beta</ZSelectItem>
				</ZSelectContent>
			</ZSelect>
		</ZFormField>
		<ZFormField name="scopes" label="Rejected scopes">
			<ZMultiSelect>
				<ZMultiSelectTrigger aria-label="Rejected scopes" data-testid="rejected-multi-trigger" />
				<ZMultiSelectContent>
					<ZMultiSelectItem data-testid="rejected-multi-read" value="read"
						>Rejected Read</ZMultiSelectItem
					>
					<ZMultiSelectItem data-testid="rejected-multi-write" value="write"
						>Rejected Write</ZMultiSelectItem
					>
				</ZMultiSelectContent>
			</ZMultiSelect>
		</ZFormField>
		<button type="reset">Reset rejected collection controls</button>
	</ZForm>
</ZProvider>

<output data-testid="collection-values"
	>{owner.tags?.join(',') ?? 'undefined'}|{owner.target ?? 'undefined'}|{owner.scopes?.join(',') ??
		'undefined'}</output
>
<output data-testid="collection-counts">{modelChanges}:{controlChanges}</output>
