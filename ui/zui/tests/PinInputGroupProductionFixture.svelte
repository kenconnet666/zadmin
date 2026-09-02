<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import {
		ZButton,
		ZField,
		ZInput,
		ZInputGroup,
		ZPinInput,
		ZProvider,
		ZStack,
		ZText,
		ZTextarea
	} from '../src/entrypoints/index.js';

	let groupValue = $state('api');
	let groupActions = $state(0);
	let pinLength = $state(6);
	let pinValue = $state<string | null>('12x345678');
	let pinChanges = $state(0);
	let pinCompletes = $state(0);
	let unicodeValue = $state<string | null>('A🙂');
</script>

<form data-testid="input-group-production-form">
	<ZField
		description="Unique control description"
		error="Unique control error"
		label="Endpoint owner"
		name="endpoint"
		required
		size="small"
	>
		<ZInputGroup data-testid="input-group-owner">
			{#snippet prefix()}<span data-testid="input-group-affix">https://</span>{/snippet}
			<ZInput bind:value={groupValue} data-testid="input-group-control" defaultValue="api" />
			{#snippet suffixAction()}
				<ZButton
					aria-label="Search endpoint"
					size="small"
					type="button"
					variant="ghost"
					onclick={() => (groupActions += 1)}
				>
					<Search aria-hidden="true" size={16} />
				</ZButton>
			{/snippet}
		</ZInputGroup>
	</ZField>
	<button type="reset">Reset grouped input</button>
</form>

<ZField label="External OTP" description="One bridge value" name="otp" required>
	<ZPinInput
		autocomplete="one-time-code"
		bind:value={pinValue}
		data-testid="pin-production"
		defaultValue="246810"
		form="pin-external-production-form"
		inputLabel={(index, length) => `OTP digit ${index + 1} of ${length}`}
		length={pinLength}
		onComplete={() => (pinCompletes += 1)}
		onValueChange={() => (pinChanges += 1)}
	/>
</ZField>
<form id="pin-external-production-form" data-testid="pin-external-production-form">
	<button type="reset">Reset external PIN</button>
</form>
<ZStack direction="row" gap="small">
	<ZButton data-testid="pin-clear" variant="secondary" onclick={() => (pinValue = null)}>
		Clear PIN
	</ZButton>
	<ZButton data-testid="pin-invalid" variant="secondary" onclick={() => (pinValue = '98x7654321')}>
		Inject invalid PIN
	</ZButton>
	<ZButton data-testid="pin-length" variant="secondary" onclick={() => (pinLength = 4)}>
		Shrink PIN
	</ZButton>
</ZStack>

<ZPinInput
	autocomplete="off"
	bind:value={unicodeValue}
	data-testid="pin-unicode"
	inputLabel={(index, length) => `Unicode ${index + 1} of ${length}`}
	length={3}
	mode="text"
/>

<ZField label="Grouped notes" name="notes">
	<ZInputGroup data-testid="textarea-group">
		{#snippet prefix()}Notes{/snippet}
		<ZTextarea data-testid="textarea-group-control" />
	</ZInputGroup>
</ZField>

<ZProvider direction="rtl">
	<ZInputGroup
		aria-label="RTL narrow group"
		data-testid="input-group-rtl"
		style="inline-size: 18rem;"
	>
		{#snippet prefix()}production-platform-service{/snippet}
		<ZInput aria-label="RTL resource" />
		{#snippet suffix()}.internal.example{/snippet}
	</ZInputGroup>
</ZProvider>

<output data-testid="pin-group-output">
	{groupValue}:{groupActions}:{pinValue ??
		'null'}:{pinLength}:{pinChanges}:{pinCompletes}:{unicodeValue ?? 'null'}
</output>
