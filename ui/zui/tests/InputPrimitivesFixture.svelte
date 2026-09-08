<script lang="ts">
	import ZField from '../src/components/input/ZField.svelte';
	import ZInputGroup from '../src/components/input/ZInputGroup.svelte';
	import ZNativeSelect, {
		type ZNativeSelectItem
	} from '../src/components/input/ZNativeSelect.svelte';
	import ZPasswordInput, {
		type ZPasswordInputToggleContext
	} from '../src/components/input/ZPasswordInput.svelte';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const singleItems = [
		{ value: 'svelte', label: 'Svelte' },
		{
			label: 'Other frameworks',
			options: [
				{ value: 'vue', label: 'Vue' },
				{ value: 'react', label: 'React', disabled: true }
			]
		},
		{
			label: 'Unavailable',
			disabled: true,
			options: [{ value: 'legacy', label: 'Legacy' }]
		}
	] as const satisfies readonly ZNativeSelectItem[];
	const permissionItems = [
		{ value: 'read', label: 'Read' },
		{ value: 'write', label: 'Write' },
		{ value: 'admin', label: 'Admin' }
	] as const satisfies readonly ZNativeSelectItem[];

	let password = $state('secret');
	let visible = $state(false);
	let passwordChanges = $state(0);
	let visibleChanges = $state(0);
	let passwordResets = $state(0);
	let readonlyVisible = $state(false);
	let readonlyVisibleChanges = $state(0);

	let framework = $state('svelte');
	let frameworkChanges = $state(0);
	let frameworkResets = $state(0);
	let frameworkInputs = $state(0);
	let frameworkNativeChanges = $state(0);
	let permissions = $state<readonly string[]>(['read', 'write']);
	let permissionChanges = $state(0);
	let permissionResets = $state(0);
	let permissionFrozen = $state(false);
	let readonlyChoice = $state('fixed');
	let readonlyChanges = $state(0);
	let childChoice = $state<string>();
</script>

{#snippet readonlyToggle(context: ZPasswordInputToggleContext)}
	<span
		data-disabled={context.disabled || undefined}
		data-readonly={context.readonly || undefined}
		data-testid="password-custom-toggle"
		data-visible={context.visible || undefined}>Custom</span
	>
{/snippet}

<form data-testid="password-form">
	<ZField
		label="Account password"
		description="Use at least eight characters"
		error="Password review required"
		name="password"
		required
		size="large"
	>
		<ZPasswordInput
			bind:value={password}
			bind:visible
			autocomplete="current-password"
			data-testid="password-main"
			defaultValue="secret"
			onFormReset={() => (passwordResets += 1)}
			onValueChange={() => (passwordChanges += 1)}
			onVisibleChange={() => (visibleChanges += 1)}
		/>
	</ZField>
	<button data-testid="password-reset" type="reset">Reset password</button>
</form>
<output data-testid="password-output"
	>{password}|{visible}|{passwordChanges}|{visibleChanges}|{passwordResets}</output
>

<ZField label="Readonly password" readonly>
	<ZPasswordInput
		bind:visible={readonlyVisible}
		data-testid="password-readonly"
		defaultValue="fixed-secret"
		onVisibleChange={() => (readonlyVisibleChanges += 1)}
		toggle={readonlyToggle}
	/>
</ZField>
<output data-testid="password-readonly-output">{readonlyVisible}:{readonlyVisibleChanges}</output>

<ZField disabled label="Disabled password">
	<ZPasswordInput data-testid="password-disabled" defaultValue="disabled-secret" />
</ZField>

<div style="inline-size:240px">
	<ZField label="Grouped readonly password">
		<ZInputGroup data-testid="password-group-readonly" readonly size="xsmall">
			<ZPasswordInput data-testid="password-group-readonly-input" defaultValue="group-secret" />
		</ZInputGroup>
	</ZField>
</div>

<div style="inline-size:240px">
	<ZInputGroup
		aria-label="Grouped disabled password"
		data-testid="password-group-disabled"
		disabled
	>
		<ZPasswordInput
			aria-label="Disabled grouped password"
			data-testid="password-group-disabled-input"
			defaultValue="disabled-group-secret"
		/>
	</ZInputGroup>
</div>

<section data-testid="password-sizes">
	{#each sizes as size (size)}
		<div style="inline-size:240px">
			<ZPasswordInput
				aria-label={`Password ${size}`}
				data-testid={`password-size-${size}`}
				defaultValue="secret"
				{size}
			/>
		</div>
	{/each}
</section>

<form data-testid="native-select-form">
	<ZField
		label="Framework"
		description="Choose the application framework"
		error="Framework review required"
		name="framework"
		required
		size="large"
	>
		<ZNativeSelect
			bind:value={framework}
			data-testid="native-select-single"
			defaultValue="svelte"
			items={singleItems}
			onFormReset={() => (frameworkResets += 1)}
			onchange={() => (frameworkNativeChanges += 1)}
			oninput={() => (frameworkInputs += 1)}
			onValueChange={() => (frameworkChanges += 1)}
			placeholder="Choose framework"
		/>
	</ZField>
	<button data-testid="native-select-reset" type="reset">Reset framework</button>
</form>
<output data-testid="native-select-output"
	>{framework}|{frameworkChanges}|{frameworkResets}|{frameworkInputs}|{frameworkNativeChanges}</output
>

<form data-testid="native-select-multiple-form">
	<ZNativeSelect
		bind:value={permissions}
		aria-label="Permissions"
		data-testid="native-select-multiple"
		defaultValue={['read', 'write']}
		items={permissionItems}
		multiple
		name="permission"
		nativeSize={4}
		onFormReset={() => (permissionResets += 1)}
		onValueChange={(value) => {
			permissionChanges += 1;
			permissionFrozen = Object.isFrozen(value);
		}}
		size="small"
	/>
	<button data-testid="native-select-multiple-reset" type="reset">Reset permissions</button>
</form>
<output data-testid="native-select-multiple-output"
	>{permissions.join(',')}|{permissionChanges}|{permissionResets}|{permissionFrozen}</output
>

<form data-testid="native-select-readonly-form">
	<ZNativeSelect
		bind:value={readonlyChoice}
		aria-label="Readonly choice"
		data-testid="native-select-readonly"
		defaultValue="fixed"
		name="readonly-choice"
		onValueChange={() => (readonlyChanges += 1)}
		readonly
	>
		<option value="fixed">Fixed</option>
		<option value="mutable">Mutable</option>
	</ZNativeSelect>
</form>
<output data-testid="native-select-readonly-output">{readonlyChoice}:{readonlyChanges}</output>

<form data-testid="native-select-disabled-form">
	<ZNativeSelect
		aria-label="Disabled choice"
		data-testid="native-select-disabled"
		disabled
		items={permissionItems}
		name="disabled-choice"
		value="read"
	/>
</form>

<form data-testid="native-select-children-form">
	<ZNativeSelect
		bind:value={childChoice}
		aria-label="Children source"
		data-testid="native-select-children"
		name="children-choice"
	>
		<option value="first">First native default</option>
		<optgroup label="More native choices">
			<option value="second">Second</option>
		</optgroup>
	</ZNativeSelect>
</form>
<output data-testid="native-select-children-output"
	>{childChoice === undefined ? 'undefined' : childChoice}</output
>

<section data-testid="native-select-sizes">
	{#each sizes as size (size)}
		<div style="inline-size:240px">
			<ZNativeSelect
				aria-label={`Native select ${size}`}
				data-testid={`native-select-size-${size}`}
				items={permissionItems}
				{size}
				value="read"
			/>
		</div>
	{/each}
</section>

<div style="inline-size:240px">
	<ZInputGroup data-testid="native-select-group" size="xsmall">
		<ZNativeSelect
			aria-label="Grouped native select"
			data-testid="native-select-in-group"
			items={permissionItems}
			value="read"
		/>
	</ZInputGroup>
</div>
