<script lang="ts">
	import {
		ZField,
		ZInput,
		ZSelect,
		ZSelectTrigger,
		ZSelectContent,
		ZSelectItem
	} from '../src/entrypoints/index.js';
	let error = $state<readonly string[]>(['  ', '\t\n']);
	let reservedError = $state<string>();
</script>

<button type="button" data-testid="field-audit-external">Outside</button>
<ZField
	controlId="field-audit-control"
	description="Choose an environment"
	data-testid="field-audit-composite"
>
	{#snippet label()}
		<span data-testid="field-audit-label-text">Environment</span>
		<a href="#field-audit-help" data-testid="field-audit-help-link"><span>Help</span></a>
	{/snippet}
	<ZSelect defaultValue="production">
		<ZSelectTrigger data-testid="field-audit-trigger" />
		<ZSelectContent><ZSelectItem value="production">Production</ZSelectItem></ZSelectContent>
	</ZSelect>
</ZField>
<p id="field-audit-help">Environment help</p>

<ZField
	label="Stable feedback"
	feedbackMinLines={1}
	error={reservedError}
	data-testid="field-audit-reserved"
	style="inline-size:180px"
>
	<ZInput />
</ZField>
<button
	type="button"
	data-testid="field-audit-toggle-reserved"
	onclick={() => (reservedError = reservedError ? undefined : 'One line of feedback')}
	>Toggle feedback</button
>
<button
	type="button"
	data-testid="field-audit-long-error"
	onclick={() => (reservedError = 'Long feedback '.repeat(20))}>Long feedback</button
>

<ZField
	label="Account"
	{error}
	warning={['', '  ']}
	success="  "
	description="Account help"
	data-testid="field-audit-messages"
	style="inline-size:180px"
>
	<ZInput aria-describedby="field-audit-help" data-testid="field-audit-input" />
</ZField>
<button
	type="button"
	data-testid="field-audit-errors"
	onclick={() => (error = ['Account is required', '0123456789abcdef'.repeat(12)])}
	>Show errors</button
>
<button type="button" data-testid="field-audit-clear" onclick={() => (error = [])}
	>Clear errors</button
>
