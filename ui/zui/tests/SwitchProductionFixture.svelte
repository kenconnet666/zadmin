<script lang="ts">
	import { ZButton, ZField, ZProvider, ZSwitch } from '../src/entrypoints/index.js';

	let checked = $state(true);
	let blockedClicks = $state(0);
	let changes = $state(0);
	let externalChecked = $state(true);
</script>

<form data-testid="switch-production-form">
	<ZField
		description="Required production setting"
		error="Audit policy"
		label="Security alerts"
		name="alerts"
		required
	>
		<ZSwitch
			bind:checked
			data-testid="switch-production-control"
			defaultChecked
			onCheckedChange={() => (changes += 1)}
			value="enabled"
		/>
	</ZField>
	<ZSwitch
		aria-label="Pending synchronization"
		data-testid="switch-production-loading"
		defaultChecked
		loading
		name="pending"
		onclick={() => (blockedClicks += 1)}
		value="kept"
	/>
	<ZField label="Immutable policy" name="policy" readonly>
		<ZSwitch
			data-testid="switch-production-readonly"
			defaultChecked
			onclick={() => (blockedClicks += 1)}
			value="fixed"
		/>
	</ZField>
	<ZSwitch
		aria-label="Disabled setting"
		data-testid="switch-production-disabled"
		defaultChecked
		disabled
		name="disabled"
		value="omitted"
	/>
	<ZSwitch
		aria-label="Cancelled setting"
		data-testid="switch-production-cancelled"
		onclick={(event) => event.preventDefault()}
	/>
	<ZButton data-testid="switch-production-external" onclick={() => (checked = false)}>
		External off
	</ZButton>
	<ZButton type="reset">Reset</ZButton>
</form>
<output data-testid="switch-production-output">{checked}:{changes}</output>
<output data-testid="switch-production-blocked-clicks">{blockedClicks}</output>

<form id="switch-production-external-form" data-testid="switch-production-external-form">
	<ZButton type="reset">Reset external owner</ZButton>
</form>
<ZSwitch
	bind:checked={externalChecked}
	aria-label="External form switch"
	data-testid="switch-production-external-control"
	defaultChecked
	form="switch-production-external-form"
	name="external"
	value="linked"
/>
<output data-testid="switch-production-external-output">{externalChecked}</output>

<ZProvider density="compact" direction="rtl" motion="reduced">
	<ZSwitch aria-label="RTL reduced switch" data-testid="switch-production-preferences" />
</ZProvider>
