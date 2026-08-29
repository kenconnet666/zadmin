<script lang="ts">
	import { ZTransfer, type TransferItem } from '../src/entrypoints/index.js';

	const items: readonly TransferItem[] = [
		{ key: 'production', label: 'Production' },
		{ key: 'staging', label: 'Staging' },
		{ key: 'preview', label: 'Preview' },
		{ disabled: true, key: 'legacy', label: 'Legacy' }
	];
	let value = $state<readonly (string | number)[]>(['staging']);
</script>

<form data-testid="transfer-form">
	<ZTransfer
		bind:value
		defaultValue={['staging']}
		name="channel"
		{items}
		moveToSourceLabel="Move to available"
		moveToTargetLabel="Move to selected"
	/>
	<button type="reset">Reset</button>
	<output data-testid="transfer-output">{value.join(',')}</output>
</form>
