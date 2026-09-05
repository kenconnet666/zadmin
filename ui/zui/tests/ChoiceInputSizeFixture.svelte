<script lang="ts">
	import {
		ZField,
		ZMultiSelect,
		ZMultiSelectContent,
		ZMultiSelectTrigger,
		ZProvider,
		ZRadioGroup,
		ZSelect,
		ZSelectContent,
		ZSelectTrigger,
		ZTransfer,
		type TransferItem
	} from '../src/entrypoints/index.js';

	const options = [
		{ label: 'Alpha', value: 'alpha' },
		{ label: 'Beta', value: 'beta' }
	] as const;
	const transferItems: readonly TransferItem[] = [
		{ key: 'alpha', label: 'Alpha' },
		{ key: 'beta', label: 'Beta' }
	];
</script>

<ZProvider density="compact">
	<ZSelect {options}>
		<ZSelectTrigger aria-label="Provider select" data-testid="select-provider-trigger" />
		<ZSelectContent />
	</ZSelect>
	<ZField label="Select field" size="large">
		<ZSelect {options}>
			<ZSelectTrigger aria-label="Field select" data-testid="select-field-trigger" />
			<ZSelectContent />
		</ZSelect>
	</ZField>
	<ZSelect {options} size="large">
		<ZSelectTrigger aria-label="Root select" data-testid="select-root-trigger" size="small" />
		<ZSelectContent />
	</ZSelect>

	<ZField label="Multi field" size="large">
		<ZMultiSelect {options}>
			<ZMultiSelectTrigger aria-label="Field multi" data-testid="multi-field-trigger" />
			<ZMultiSelectContent />
		</ZMultiSelect>
	</ZField>
	<ZMultiSelect {options} size="large">
		<ZMultiSelectTrigger aria-label="Root multi" data-testid="multi-root-trigger" size="small" />
		<ZMultiSelectContent />
	</ZMultiSelect>

	<ZField label="Radio field" size="large">
		<ZRadioGroup data-testid="radio-field" {options} />
	</ZField>
	<ZRadioGroup data-testid="radio-root" {options} size="small" />
	<ZSelect disabled {options}>
		<ZSelectTrigger
			aria-label="Disabled select"
			data-testid="select-disabled-trigger"
			disabled={false}
		/>
		<ZSelectContent />
	</ZSelect>
	<ZMultiSelect disabled {options}>
		<ZMultiSelectTrigger
			aria-label="Disabled multi"
			data-testid="multi-disabled-trigger"
			disabled={false}
		/>
		<ZMultiSelectContent />
	</ZMultiSelect>

	<ZTransfer data-testid="transfer-disabled" disabled filterable={false} items={transferItems} />
	<ZTransfer
		data-testid="transfer-disabled-virtual"
		disabled
		filterable={false}
		items={transferItems}
		virtual
	/>
</ZProvider>
