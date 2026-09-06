<script lang="ts">
	import {
		ZCalendar,
		ZCombobox,
		ZComboboxContent,
		ZComboboxInput,
		ZDateField,
		ZDateRangePicker,
		ZField,
		ZFileUpload,
		ZMention,
		ZProvider,
		ZSegmented,
		ZTimeField,
		createFileUploadItem,
		defaultTheme,
		extendTheme
	} from '../src/entrypoints/index.js';

	const theme = extendTheme(defaultTheme, {
		fontFamily: { sans: 'monospace' },
		fontSize: { medium: 15 },
		opacity: { disabled: 0.4 }
	});
	const sizes = ['small', 'medium', 'large'] as const;
	const options = [{ label: 'Alpha', value: 'alpha' }];
	const mentions = [{ key: 'alice', label: 'Alice', value: 'alice' }];
	const defaultFiles = [createFileUploadItem('audit-file', new File(['audit'], 'audit.txt'))];
	let readonly = $state(false);
	let disabled = $state(false);
	let changes = $state(0);
	let resets = $state(0);
	let dateResets = $state(0);
	let timeResets = $state(0);
</script>

<ZProvider {theme} density="compact" motion="reduced">
	{#each sizes as size (size)}
		<ZField label={`Combobox ${size}`} {size}>
			<ZCombobox {options}>
				<ZComboboxInput data-testid={`audit-combobox-${size}`} />
				<ZComboboxContent />
			</ZCombobox>
		</ZField>
		<ZField label={`Segmented ${size}`} {size}>
			<ZSegmented data-testid={`audit-segmented-${size}`} {options} defaultValue="alpha" />
		</ZField>
	{/each}
	<ZField label="Combobox overrides" size="large">
		<ZCombobox {options} size="medium">
			<ZComboboxInput size="small" data-testid="audit-combobox-override" />
			<ZComboboxContent />
		</ZCombobox>
	</ZField>
	<form data-testid="audit-mention-form">
		<ZField label="Mention state" name="comment" {disabled} {readonly}>
			<ZMention
				data-testid="audit-mention"
				items={mentions}
				defaultValue="Initial"
				onValueChange={() => (changes += 1)}
				onFormReset={() => (resets += 1)}
			/>
		</ZField>
	</form>
	<button type="button" data-testid="audit-readonly" onclick={() => (readonly = !readonly)}
		>Readonly</button
	>
	<button type="button" data-testid="audit-disabled" onclick={() => (disabled = !disabled)}
		>Disabled</button
	>
	<output data-testid="audit-mention-events">{changes}:{resets}</output>
	<form data-testid="audit-date-form">
		<ZDateField name="date" onFormReset={() => (dateResets += 1)} />
		<ZTimeField name="time" onFormReset={() => (timeResets += 1)} />
	</form>
	<output data-testid="audit-date-events">{dateResets}:{timeResets}</output>
	<ZFileUpload data-testid="audit-upload" {defaultFiles} disabled />
	<ZDateRangePicker data-testid="audit-range" disabled />
	<ZCalendar data-testid="audit-calendar" />
</ZProvider>
