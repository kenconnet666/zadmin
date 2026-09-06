<script lang="ts">
	import {
		ZButton,
		ZCheckbox,
		ZField,
		ZFieldset,
		ZInput,
		ZInputGroup,
		ZNativeSelect,
		ZPasswordInput,
		ZProvider,
		ZSwitch,
		ZTextarea
	} from '../src/entrypoints/index.js';
	let disabled = $state(true);
</script>

<ZProvider density="compact" componentDefaults={{ fieldset: { size: 'large' } }}>
	<form data-testid="fieldset-form">
		<p id="fieldset-external">Shared account settings</p>
		<ZFieldset
			{disabled}
			data-testid="fieldset-main"
			description="Group description"
			aria-describedby="fieldset-external"
		>
			{#snippet legend()}
				Account <ZButton data-testid="fieldset-enable" onclick={() => (disabled = !disabled)}
					>Toggle group</ZButton
				>
			{/snippet}
			<ZField label="Name"
				><ZInput name="username" defaultValue="Ada" data-testid="fieldset-input" /></ZField
			>
			<ZField label="Plan"
				><ZNativeSelect
					name="plan"
					defaultValue="basic"
					items={[
						{ value: 'basic', label: 'Basic' },
						{ value: 'pro', label: 'Pro' }
					]}
					data-testid="fieldset-select"
				/></ZField
			>
			<ZField label="Secret">
				<ZInputGroup data-testid="fieldset-input-group">
					{#snippet prefix()}Key{/snippet}
					<ZPasswordInput name="secret" defaultValue="hidden" data-testid="fieldset-password" />
				</ZInputGroup>
			</ZField>
			<ZField label="Memo"
				><ZTextarea name="memo" defaultValue="Notes" data-testid="fieldset-textarea" /></ZField
			>
			<ZCheckbox aria-label="Agree" name="agree" defaultChecked data-testid="fieldset-checkbox" />
			<ZSwitch aria-label="Alerts" name="alerts" defaultChecked data-testid="fieldset-switch" />
			<ZButton data-testid="fieldset-action">Action</ZButton>
		</ZFieldset>
		<ZFieldset
			legend="A very long grouping title without truncation — abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz"
			variant="plain"
			data-testid="fieldset-long"
		>
			<ZField label="Always disabled"
				><ZInput disabled name="locked" data-testid="fieldset-locked" /></ZField
			>
		</ZFieldset>
	</form>
</ZProvider>
