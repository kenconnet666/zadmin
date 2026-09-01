<script lang="ts">
	import { ZVirtualList } from '../src/entrypoints/index.js';

	let errors = $state<string[]>([]);
	const duplicateIds = [
		{ id: 'one', slot: 'same' },
		{ id: 'two', slot: 'same' }
	];
	function capture(error: unknown): void {
		errors = [...errors, error instanceof Error ? error.message : String(error)];
	}
</script>

<svelte:boundary onerror={capture}>
	<ZVirtualList aria-label="Invalid size" itemSize={0} items={[]} itemKey={() => 'none'}>
		{#snippet item()}never{/snippet}
	</ZVirtualList>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZVirtualList
		aria-label="Conflicting sizes"
		estimateSize={20}
		itemSize={20}
		items={[]}
		itemKey={() => 'none'}
	>
		{#snippet item()}never{/snippet}
	</ZVirtualList>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZVirtualList
		aria-label="Conflicting initial position"
		initialIndex={0}
		initialKey="none"
		items={[]}
		itemKey={() => 'none'}
	>
		{#snippet item()}never{/snippet}
	</ZVirtualList>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZVirtualList items={[]} itemKey={() => 'none'} role="listbox">
		{#snippet item()}never{/snippet}
	</ZVirtualList>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZVirtualList aria-label="Invalid role" itemRole="treeitem" items={[]} itemKey={() => 'none'}>
		{#snippet item()}never{/snippet}
	</ZVirtualList>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZVirtualList
		aria-label="Invalid selection projection"
		itemSelected={() => false}
		items={[]}
		itemKey={() => 'none'}
	>
		{#snippet item()}never{/snippet}
	</ZVirtualList>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZVirtualList
		aria-label="Duplicate ids"
		itemId={(item) => item.slot}
		itemKey={(item) => item.id}
		items={duplicateIds}
	>
		{#snippet item()}never{/snippet}
	</ZVirtualList>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZVirtualList
		aria-label="Invalid estimate"
		estimateSize={() => -1}
		itemKey={(item) => item}
		items={['one']}
	>
		{#snippet item()}never{/snippet}
	</ZVirtualList>
</svelte:boundary>
<svelte:boundary onerror={capture}>
	<ZVirtualList
		aria-label="Unknown initial key"
		initialKey="missing"
		itemKey={(item) => item}
		items={['one']}
	>
		{#snippet item()}never{/snippet}
	</ZVirtualList>
</svelte:boundary>

<svelte:boundary onerror={capture}>
	<ZVirtualList
		aria-label="Invalid tree metadata"
		itemLevel={() => 1}
		items={[]}
		itemKey={() => 'none'}
	>
		{#snippet item()}never{/snippet}
	</ZVirtualList>
</svelte:boundary>

<output data-testid="virtual-boundary-output">{errors.length}:{errors.join('|')}</output>
