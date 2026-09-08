<script lang="ts">
	import ZCheckboxGroup from '../src/components/compound/checkbox-group/ZCheckboxGroup.svelte';
	import ZCheckboxGroupItem from '../src/components/compound/checkbox-group/ZCheckboxGroupItem.svelte';
	import ZCheckboxGroupSelectAll from '../src/components/compound/checkbox-group/ZCheckboxGroupSelectAll.svelte';
	import ZField from '../src/components/input/ZField.svelte';

	type Permission = 'admin' | 'read' | 'share' | 'write';
	let permissions = $state<readonly Permission[]>(['read']);
	let numeric = $state<readonly number[]>([1]);
	let partial = $state<readonly string[]>([]);
	let requiredValues = $state<readonly string[]>([]);
	let changes = $state(0);
	let readonly = $state(false);
	let fieldsetDisabled = $state(false);
	let showWrite = $state(true);

	export function setReadonly(next: boolean): void {
		readonly = next;
	}

	export function setFieldsetDisabled(next: boolean): void {
		fieldsetDisabled = next;
	}

	export function removeWrite(): void {
		showWrite = false;
	}

	export function overflowRequired(): void {
		requiredValues = ['a', 'b', 'c'];
	}
</script>

<form data-testid="checkbox-group-form">
	<ZField label="Permissions" name="permission" required size="large">
		<ZCheckboxGroup
			bind:value={permissions}
			data-testid="checkbox-group-main"
			defaultValue={['read']}
			maxSelected={2}
			minSelected={1}
			onValueChange={() => (changes += 1)}
			orientation="horizontal"
			{readonly}
			tone="success"
		>
			<ZCheckboxGroupSelectAll data-testid="checkbox-group-all"
				>All permissions</ZCheckboxGroupSelectAll
			>
			<ZCheckboxGroupItem data-testid="checkbox-group-read" value="read">Read</ZCheckboxGroupItem>
			{#if showWrite}
				<ZCheckboxGroupItem data-testid="checkbox-group-write" value="write"
					>Write</ZCheckboxGroupItem
				>
			{/if}
			<ZCheckboxGroupItem data-testid="checkbox-group-share" value="share">Share</ZCheckboxGroupItem
			>
			<ZCheckboxGroupItem data-testid="checkbox-group-admin" value="admin" disabled>
				Admin
			</ZCheckboxGroupItem>
		</ZCheckboxGroup>
	</ZField>
	<button type="reset">Reset</button>
</form>

<ZCheckboxGroup
	bind:value={numeric}
	aria-label="Numeric options"
	data-testid="checkbox-group-options"
	name="numeric"
	onValueChange={() => (changes += 1)}
	options={[
		{ label: 'One', value: 1 },
		{ label: 'Two', value: 2 },
		{ disabled: true, label: 'Three', value: 3 }
	]}
/>

<form data-testid="checkbox-group-required-form">
	<ZCheckboxGroup
		bind:value={requiredValues}
		aria-label="Required empty group"
		data-testid="checkbox-group-required"
		maxSelected={2}
		minSelected={2}
		name="required-choice"
		options={[
			{ label: 'Required A', value: 'a' },
			{ label: 'Required B', value: 'b' },
			{ label: 'Required C', value: 'c' }
		]}
		required
		validationMessage="Choose two permissions."
	/>
</form>

<fieldset disabled={fieldsetDisabled}>
	<ZCheckboxGroup
		aria-label="Native fieldset group"
		data-testid="checkbox-group-fieldset"
		defaultValue={['enabled']}
		name="fieldset-choice"
		options={[{ label: 'Enabled option', value: 'enabled' }]}
	/>
</fieldset>

<ZCheckboxGroup
	bind:value={partial}
	aria-label="Partial native fieldset group"
	data-testid="checkbox-group-partial-fieldset"
	name="partial-choice"
>
	<ZCheckboxGroupSelectAll data-testid="checkbox-group-partial-all"
		>All available</ZCheckboxGroupSelectAll
	>
	<fieldset disabled>
		<ZCheckboxGroupItem data-testid="checkbox-group-partial-disabled" value="disabled">
			Disabled by fieldset
		</ZCheckboxGroupItem>
	</fieldset>
	<ZCheckboxGroupItem data-testid="checkbox-group-partial-enabled" value="enabled">
		Enabled outside fieldset
	</ZCheckboxGroupItem>
</ZCheckboxGroup>

{#each ['xsmall', 'small', 'medium', 'large', 'xlarge'] as checkboxSize (checkboxSize)}
	<ZCheckboxGroup
		aria-label={`${checkboxSize} group`}
		data-testid={`checkbox-group-${checkboxSize}`}
		defaultValue={[checkboxSize]}
		options={[{ label: checkboxSize, value: checkboxSize }]}
		size={checkboxSize as 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'}
		tone="info"
	/>
{/each}

<output data-testid="checkbox-group-output"
	>{permissions.join(',')}|{numeric.join(',')}|{changes}</output
>
<output data-testid="checkbox-group-partial-output">{partial.join(',')}</output>
