<script lang="ts">
	import { tick } from 'svelte';
	import {
		ZProvider,
		ZVirtualList,
		type ZVirtualListController
	} from '../src/entrypoints/index.js';

	type RowKey = `row-${number}` | 'prepended';

	interface Row {
		disabled?: boolean;
		height: number;
		id: RowKey;
		label: string;
	}

	let rows = $state<Row[]>(
		Array.from({ length: 200 }, (_, index) => ({
			disabled: index === 3,
			height: index % 3 === 0 ? 56 : 32,
			id: `row-${index}` as const,
			label: `Dynamic row ${index}`
		}))
	);
	let controller = $state<ZVirtualListController<RowKey> | null>(null);
	let activeKey = $state<RowKey>();
	let activeId = $state<string>();
	let loading = $state(true);
	// Stable ids are allocated while ZVirtualList derives normalized items; this cache must stay non-reactive.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const optionIds = new Map<RowKey, string>();
	// Mounted DOM ownership is imperative test bookkeeping, not rendered state.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const mountedOptions = new Map<RowKey, { element: HTMLElement; token: symbol }>();
	let nextOptionSlot = 0;

	function optionId(key: RowKey): string {
		let id = optionIds.get(key);
		if (!id) {
			nextOptionSlot += 1;
			id = `virtual-option-${nextOptionSlot}`;
			optionIds.set(key, id);
		}
		return id;
	}

	function mountOption(key: RowKey, element: HTMLElement): () => void {
		const token = Symbol();
		mountedOptions.set(key, { element, token });
		return () => {
			if (mountedOptions.get(key)?.token === token) mountedOptions.delete(key);
		};
	}

	function synchronizeActiveId(): void {
		activeId = activeKey === undefined ? undefined : mountedOptions.get(activeKey)?.element.id;
	}

	async function activateLast(): Promise<void> {
		activeKey = 'row-199';
		controller?.ensureKey(activeKey, 'end');
		await tick();
		synchronizeActiveId();
	}

	function prepend(): void {
		rows = [{ height: 72, id: 'prepended', label: 'Prepended row' }, ...rows];
	}
</script>

<ZProvider motion="reduced">
	<button type="button" data-testid="virtual-activate" onclick={activateLast}>Activate last</button>
	<button type="button" data-testid="virtual-prepend" onclick={prepend}>Prepend</button>
	<button
		type="button"
		data-testid="virtual-smooth"
		onclick={() => controller?.scrollToKey('row-100', 'center', 'smooth')}
		>Smooth request
	</button>
	<input
		data-testid="virtual-focus-owner"
		role="combobox"
		aria-controls="virtual-options"
		aria-expanded="true"
		aria-activedescendant={activeId}
	/>
	<ZVirtualList
		aria-label="Dynamic deployment options"
		bind:controller
		estimateSize={(row) => row.height}
		height={160}
		itemDisabled={(row) => row.disabled ?? false}
		itemId={(row) => optionId(row.id)}
		itemKey={(row) => row.id}
		itemSelected={(row) => row.id === activeKey}
		items={rows}
		onItemMount={mountOption}
		onRangeChange={synchronizeActiveId}
		overscan={2}
		role="listbox"
		data-testid="virtual-dynamic"
		id="virtual-options"
	>
		<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -- the positional index is required to receive the virtual item argument. -->
		{#snippet item(row, _index, virtual)}
			<div
				style={`box-sizing: border-box; height: ${row.height}px; padding: 6px;`}
				data-row-key={row.id}
				data-measurement={virtual.measured ? 'measured' : 'estimated'}
			>
				{row.label}
			</div>
		{/snippet}
	</ZVirtualList>
	<output data-testid="virtual-active-output"
		>{activeKey ?? 'none'}:{activeId ?? 'unmounted'}</output
	>
	<ZVirtualList
		aria-label="Explicit unselected options"
		height={40}
		itemKey={(entry) => entry}
		itemSize={40}
		items={['unselected']}
		role="listbox"
		data-testid="virtual-unselected"
	>
		{#snippet item(entry)}{entry}{/snippet}
	</ZVirtualList>

	<button type="button" data-testid="virtual-state-toggle" onclick={() => (loading = !loading)}
		>Toggle state
	</button>
	<ZVirtualList
		aria-label="Empty deployment records"
		height={80}
		items={[] as Row[]}
		itemKey={(row) => row.id}
		{loading}
		data-testid="virtual-state"
	>
		{#snippet item(row)}{row.label}{/snippet}
		{#snippet loadingContent()}Loading deployment records{/snippet}
		{#snippet empty()}No deployment records{/snippet}
	</ZVirtualList>
</ZProvider>
