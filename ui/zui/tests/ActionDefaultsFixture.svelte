<script lang="ts">
	import {
		ZButton,
		ZCopyButton,
		ZField,
		ZProvider,
		ZSegmented,
		ZToggleGroup,
		ZToolbar
	} from '../src/entrypoints/index.js';

	const items = [
		{ label: 'One', value: 'one' },
		{ label: 'Two', value: 'two' }
	] as const;
	const options = [
		{ label: 'One', value: 'one' },
		{ label: 'Two', value: 'two' }
	] as const;
</script>

<ZProvider
	componentDefaults={{
		button: { size: 'small', tone: 'danger' },
		input: { size: 'large' },
		toggleGroup: { size: 'xsmall' }
	}}
>
	<div data-testid="provider-surfaces">
		<ZButton data-testid="provider-button">Provider button</ZButton>
		<ZToggleGroup aria-label="Provider toggle group" data-testid="provider-toggle" {items} />
		<ZSegmented aria-label="Provider segmented" data-testid="provider-segmented" {options} />
		<ZCopyButton data-testid="provider-copy" value="copy-me" />
	</div>

	<ZToolbar aria-label="Action defaults toolbar" data-testid="action-toolbar" size="large">
		<ZButton data-testid="toolbar-button">Toolbar button</ZButton>
		<ZToggleGroup aria-label="Toolbar toggle group" data-testid="toolbar-toggle" {items} />
		<ZSegmented aria-label="Toolbar segmented" data-testid="toolbar-segmented" {options} />
		<ZProvider componentDefaults={{ segmented: { size: 'medium' } }}>
			<ZSegmented
				aria-label="Toolbar segmented family default"
				data-testid="toolbar-segmented-family"
				{options}
			/>
		</ZProvider>
		<ZButton data-testid="toolbar-explicit-button" size="xsmall">Explicit button</ZButton>

		<ZField data-testid="field-toggle-owner" label="Field toggle" size="xlarge">
			<ZToggleGroup aria-label="Field toggle group" data-testid="field-toggle" {items} />
		</ZField>
		<ZField data-testid="field-segmented-owner" label="Field segmented" size="xlarge">
			<ZSegmented aria-label="Field segmented" data-testid="field-segmented" {options} />
		</ZField>
	</ZToolbar>
</ZProvider>

<ZProvider componentDefaults={{ segmented: { size: 'small' } }}>
	<ZToolbar aria-label="Inherited family default toolbar" size="xlarge">
		<ZButton data-testid="inherited-family-toolbar-button">Toolbar fallback</ZButton>
		<ZSegmented
			aria-label="Segmented inherited family default"
			data-testid="inherited-family-segmented"
			{options}
		/>
	</ZToolbar>
</ZProvider>
