<script lang="ts">
	import { ZTransfer, type TransferItem } from '../src/entrypoints/index.js';

	const items: readonly TransferItem[] = [
		{ key: 'production', label: 'Production' },
		{ key: 'staging', label: 'Staging' },
		{ key: 'preview', label: 'Preview' },
		{ disabled: true, key: 'legacy', label: 'Legacy' }
	];
	let value = $state<readonly (string | number)[]>(['staging']);
	let valueChangeCount = $state(0);
</script>

<form data-testid="transfer-form">
	<ZTransfer
		bind:value
		defaultValue={['staging']}
		name="channel"
		{items}
		moveToSourceLabel="Move to available"
		moveToTargetLabel="Move to selected"
		onValueChange={() => (valueChangeCount += 1)}
	/>
	<button type="reset">Reset</button>
</form>
<output data-testid="transfer-output">{value.join(',')}</output>
<output data-testid="transfer-value-change-count">{valueChangeCount}</output>
