<script lang="ts">
	import {
		ZField,
		ZTransfer,
		type SelectionKey,
		type TransferItem
	} from '../src/entrypoints/index.js';

	const baseItems: readonly TransferItem[] = [
		{ key: 1, label: 'Number one' },
		{ key: '1', label: 'String one' },
		{ description: 'Current filter target', key: 'alpha', label: 'Alpha' },
		{ disabled: true, key: 'disabled', label: 'Disabled' }
	];
	const virtualItems: readonly TransferItem[] = Array.from({ length: 1000 }, (_, index) => ({
		disabled: index === 500,
		key: index,
		label: `Virtual node ${index + 1}`
	}));
	let items = $state<readonly TransferItem[]>(baseItems);
	let loading = $state(false);
	let value = $state<readonly SelectionKey[]>(['1', 'orphan']);
	let changes = $state(0);
	let virtualValue = $state<readonly SelectionKey[]>([0, 999]);
</script>

<form data-testid="transfer-production-form">
	<ZField label="Channels" name="channel" required>
		<ZTransfer
			bind:value
			data-testid="transfer-production"
			defaultValue={['1', 'orphan']}
			{items}
			{loading}
			onValueChange={() => (changes += 1)}
			sourceTitle="Available"
			targetTitle="Selected"
		/>
	</ZField>
	<button type="button" data-testid="transfer-empty-items" onclick={() => (items = [])}>
		Empty page
	</button>
	<button
		type="button"
		data-testid="transfer-restore-items"
		onclick={() => {
			items = baseItems;
			loading = false;
		}}
	>
		Restore page
	</button>
	<button type="button" data-testid="transfer-loading" onclick={() => (loading = !loading)}>
		Toggle loading
	</button>
	<button type="reset">Reset</button>
	<output data-testid="transfer-production-output">
		{value.map((key) => `${typeof key}:${key}`).join('|')}:{changes}
	</output>
</form>

<ZTransfer
	data-testid="transfer-readonly"
	defaultValue={['1']}
	items={baseItems}
	readonly
	sourceTitle="Readonly available"
	targetTitle="Readonly selected"
/>

<ZTransfer
	bind:value={virtualValue}
	data-testid="transfer-virtual"
	defaultValue={[0, 999]}
	filterable={false}
	items={virtualItems}
	sourceTitle="Virtual available"
	targetTitle="Virtual selected"
	virtual
	virtualHeight={160}
	virtualItemSize={40}
/>
<output data-testid="transfer-virtual-output">{virtualValue.join(',')}</output>
