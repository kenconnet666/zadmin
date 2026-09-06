<script lang="ts">
	import {
		ZForm,
		ZFormField,
		ZInput,
		ZNativeSelect,
		ZButton,
		type ZFormController
	} from '../src/entrypoints/index.js';
	let controller = $state<ZFormController | null>(null);
	let name = $state('Ada');
	let permissions = $state<readonly string[]>(['read', 'write']);
	let dirty = $state(false);
	let touched = $state(false);
	let cancelReset = $state(false);
	let showName = $state(true);
	let extraPermission = $state(false);
	export function showExtraPermission(show: boolean) {
		extraPermission = show;
	}
	export function readValues() {
		return controller!.getValues();
	}
	export function readName() {
		return controller!.getFieldValue(['user', 'name']);
	}
	export function getController() {
		return controller!;
	}
</script>

<ZForm
	data-testid="native-values-form"
	bind:controller
	onreset={(event) => {
		if (cancelReset) event.preventDefault();
	}}
>
	{#if showName}
		<ZFormField
			label="Account name"
			name={['user', 'name']}
			onStateChange={(next) => {
				dirty = next.dirty;
				touched = next.touched;
			}}
		>
			<ZInput data-testid="native-values-name" bind:value={name} defaultValue="Ada" />
		</ZFormField>
	{/if}
	<ZFormField label="Permissions" name="permissions">
		<ZNativeSelect
			multiple
			bind:value={permissions}
			defaultValue={['read', 'write']}
			items={[
				{ value: 'read', label: 'Read' },
				{ value: 'write', label: 'Write' }
			]}
		/>
	</ZFormField>
	{#if extraPermission}
		<ZFormField label="Extra permission" name="permissions"
			><ZInput defaultValue="audit" /></ZFormField
		>
	{/if}
	<ZFormField label="Excluded" name="excluded" disabled
		><ZInput defaultValue="private" /></ZFormField
	>
	<ZButton type="reset" data-testid="native-values-reset">Reset</ZButton>
</ZForm>
<ZButton onclick={() => (cancelReset = !cancelReset)} data-testid="native-values-cancel"
	>Toggle reset cancellation</ZButton
>
<ZButton onclick={() => (showName = !showName)} data-testid="native-values-show"
	>Toggle field</ZButton
>
<output data-testid="native-values-state">{dirty}:{touched}</output>
