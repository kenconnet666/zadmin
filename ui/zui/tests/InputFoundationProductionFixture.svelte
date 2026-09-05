<script lang="ts">
	import { ZField, ZInput, ZInputGroup, ZProvider, ZTextarea } from '../src/entrypoints/index.js';

	let inputValue = $state('seed');
	let textareaValue = $state('notes');
	let inputChanges = $state(0);
	let textareaChanges = $state(0);
</script>

<ZProvider componentDefaults={{ input: { size: 'large' } }}>
	<form data-testid="input-foundation-form" id="input-foundation-form">
		<ZInput
			bind:value={inputValue}
			autocomplete="username"
			data-testid="input-foundation-control"
			defaultValue="seed"
			maxlength={12}
			name="account"
			onValueChange={() => (inputChanges += 1)}
			required
		/>
		<ZInput data-testid="input-foundation-explicit-small" size="small" value="small" />
		<ZInputGroup
			data-testid="input-foundation-group"
			style="inline-size: 12rem; max-inline-size: 100%;"
		>
			{#snippet prefix()}a-very-long-prefix{/snippet}
			<ZInput data-testid="input-foundation-group-control" defaultValue="group" name="group" />
			{#snippet suffix()}-a-very-long-suffix{/snippet}
		</ZInputGroup>
		<ZField label="Field sized group" size="small">
			<ZInputGroup data-testid="input-foundation-field-group">
				<ZInput data-testid="input-foundation-field-group-control" value="field" />
			</ZInputGroup>
		</ZField>
		<ZField disabled label="Disabled input">
			<ZInput data-testid="input-foundation-disabled" defaultValue="disabled" />
		</ZField>
		<ZField label="Readonly input" readonly>
			<ZInput data-testid="input-foundation-readonly" defaultValue="readonly" />
		</ZField>
		<ZInputGroup disabled data-testid="input-foundation-disabled-group">
			<ZInput data-testid="input-foundation-disabled-group-control" value="disabled" />
		</ZInputGroup>
		<ZInputGroup disabled data-testid="textarea-foundation-disabled-group">
			<ZTextarea data-testid="textarea-foundation-disabled-group-control" value="disabled" />
		</ZInputGroup>
		<ZTextarea
			bind:value={textareaValue}
			autosize={{ minRows: 2, maxRows: 3 }}
			data-testid="textarea-foundation-control"
			defaultValue="notes"
			name="notes"
			onValueChange={() => (textareaChanges += 1)}
			rows={2}
		/>
		<button type="reset">Reset</button>
	</form>
	<output data-testid="input-foundation-output">
		{inputValue}:{textareaValue}:{inputChanges}:{textareaChanges}
	</output>
</ZProvider>
