<script lang="ts">
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZOverflowList, {
		type OverflowListState
	} from '../src/components/layout/ZOverflowList.svelte';

	type Item = Readonly<{ key: number | string; label: string; width?: number }>;
	type OverflowController = Readonly<{ refresh(): void }>;

	let width = $state(640);
	let suspended = $state(false);
	let labels = $state<readonly Item[]>([
		{ key: 'label-a', label: 'Short' },
		{ key: 'label-b', label: 'Second' },
		{ key: 'label-c', label: 'Third' }
	]);
	let geometry = $state<OverflowController | null>(null);
	let labelList = $state<OverflowController | null>(null);
	let updates = $state('');
	let fixedPointWidth = $state(90);
	let toggleCollapse = $state(false);
	let toggleSuspended = $state(false);
	let nonMonotonicUpdates = $state(0);
	let nonMonotonicSnapshot = $state('');

	const geometryItems: readonly Item[] = [
		{ key: 1, label: 'One', width: 110 },
		{ key: '1', label: 'String one', width: 110 },
		{ key: 'third', label: 'Third', width: 110 },
		{ key: 'fourth', label: 'Fourth', width: 110 }
	];
	const multiRowItems: readonly Item[] = [
		{ key: 'north', label: 'North', width: 100 },
		{ key: 'east', label: 'East', width: 100 },
		{ key: 'south', label: 'South', width: 100 },
		{ key: 'west', label: 'West', width: 100 }
	];
	const fixedPointItems: readonly Item[] = [
		{ key: 'fixed-a', label: 'Fixed A', width: 80 },
		{ key: 'fixed-b', label: 'Fixed B', width: 80 },
		{ key: 'fixed-c', label: 'Fixed C', width: 80 }
	];

	export function setWidth(next: number): void {
		width = next;
	}

	export function setSuspended(next: boolean): void {
		suspended = next;
	}

	export function setFixedPointWidth(next: number): void {
		fixedPointWidth = next;
	}

	export function enableCollapseWhileSuspended(): void {
		toggleSuspended = true;
		toggleCollapse = true;
	}

	export function releaseCollapseMeasurement(): void {
		toggleSuspended = false;
	}

	export function setLongLabels(): void {
		labels = [
			{ key: 'label-a', label: 'Workspace production release with a deliberately long title' },
			{ key: 'label-b', label: 'Second workspace release title' },
			{ key: 'label-c', label: 'Third workspace release title' }
		];
	}

	export function refreshForFontOrStyleChange(): void {
		labelList?.refresh();
	}

	export function notifyFontsChanged(): void {
		document.fonts?.dispatchEvent(new Event('loadingdone'));
	}

	export function focusGeometry(key: Item['key']): void {
		document.querySelector<HTMLButtonElement>(`[data-testid="geometry-${String(key)}"]`)?.focus();
	}

	function publish(state: OverflowListState<Item>): void {
		updates = `${state.visibleKeys.map(String).join(',')}|${state.overflowKeys.map(String).join(',')}|${state.measured}:${state.fits}`;
	}

	function publishNonMonotonic(state: OverflowListState<Item>): void {
		nonMonotonicUpdates += 1;
		nonMonotonicSnapshot = `${state.visibleKeys.length}|${state.overflowKeys.length}|${state.fits}`;
	}
</script>

{#snippet geometryItem(entry: Item)}
	<button
		data-testid={`geometry-${String(entry.key)}`}
		id={`overflow-item-${typeof entry.key}-${String(entry.key)}`}
		style={`inline-size: ${entry.width}px; white-space: nowrap`}
		type="button"
	>
		{entry.label}
	</button>
{/snippet}
{#snippet geometryOverflow(state: OverflowListState<Item>)}
	<button
		data-testid="geometry-overflow"
		data-overflow-count={state.overflowItems.length}
		type="button">+{state.overflowItems.length}</button
	>
{/snippet}
{#snippet labelItem(entry: Item)}
	<button data-testid={`label-${String(entry.key)}`} style="white-space: nowrap" type="button"
		>{entry.label}</button
	>
{/snippet}
{#snippet labelOverflow(state: OverflowListState<Item>)}
	<button
		data-testid="label-overflow"
		data-overflow-count={state.overflowItems.length}
		type="button">+{state.overflowItems.length}</button
	>
{/snippet}
{#snippet fixedPointItem(entry: Item)}
	<span
		data-testid={`fixed-point-${entry.key}`}
		style={`box-sizing: border-box; display: block; inline-size: ${entry.width}px; white-space: nowrap`}
		>{entry.label}</span
	>
{/snippet}
{#snippet shrinkingOverflow(state: OverflowListState<Item>)}
	<span
		data-testid="shrinking-overflow"
		data-overflow-count={state.overflowItems.length}
		style={`box-sizing: border-box; display: block; inline-size: ${state.overflowItems.length > 2 ? 90 : 20}px`}
	></span>
{/snippet}
{#snippet fixedOverflow(state: OverflowListState<Item>)}
	<span
		data-testid="fixed-overflow"
		data-overflow-count={state.overflowItems.length}
		style="box-sizing: border-box; display: block; inline-size: 20px"
	></span>
{/snippet}
{#snippet nonMonotonicOverflow(state: OverflowListState<Item>)}
	<span
		data-testid="non-monotonic-overflow"
		data-overflow-count={state.overflowItems.length}
		style={`box-sizing: border-box; display: block; inline-size: ${state.overflowItems.length === 1 ? 90 : 20}px`}
	></span>
{/snippet}

<div data-testid="overflow-geometry-owner" style={`width: ${width}px`}>
	<ZOverflowList
		bind:this={geometry}
		collapseFrom="end"
		data-testid="overflow-geometry"
		gap={8}
		item={geometryItem}
		itemKey={(entry) => entry.key}
		items={geometryItems}
		maxRows={1}
		onVisibleItemsChange={publish}
		overflow={geometryOverflow}
		{suspended}
	/>
</div>

<div data-testid="overflow-label-owner" style="width: 240px">
	<ZOverflowList
		bind:this={labelList}
		data-testid="overflow-labels"
		gap={8}
		item={labelItem}
		itemKey={(entry) => entry.key}
		items={labels}
		maxRows={1}
		overflow={labelOverflow}
	/>
</div>

<ZProvider direction="rtl">
	<div data-testid="overflow-rtl-owner" style="width: 220px">
		<ZOverflowList
			collapseFrom="start"
			data-testid="overflow-rtl"
			gap={8}
			item={geometryItem}
			itemKey={(entry) => entry.key}
			items={multiRowItems}
			maxRows={2}
			overflow={geometryOverflow}
		/>
	</div>
</ZProvider>

<div data-testid="overflow-fixed-point-owner" style={`width: ${fixedPointWidth}px`}>
	<ZOverflowList
		collapseFrom="end"
		data-testid="overflow-fixed-point"
		gap={10}
		item={fixedPointItem}
		itemKey={(entry) => entry.key}
		items={fixedPointItems}
		maxRows={1}
		overflow={shrinkingOverflow}
	/>
</div>

<div data-testid="overflow-toggle-owner" style="width: 90px">
	<ZOverflowList
		collapse={toggleCollapse}
		collapseFrom="end"
		data-testid="overflow-toggle"
		gap={10}
		item={fixedPointItem}
		itemKey={(entry) => entry.key}
		items={fixedPointItems}
		maxRows={1}
		overflow={fixedOverflow}
		suspended={toggleSuspended}
	/>
</div>

<div data-testid="overflow-non-monotonic-owner" style="width: 205px">
	<ZOverflowList
		collapseFrom="end"
		data-testid="overflow-non-monotonic"
		gap={10}
		item={fixedPointItem}
		itemKey={(entry) => entry.key}
		items={fixedPointItems}
		maxRows={1}
		onVisibleItemsChange={publishNonMonotonic}
		overflow={nonMonotonicOverflow}
	/>
</div>

<output data-testid="overflow-output">{updates}</output>
<output data-testid="overflow-non-monotonic-output" data-updates={nonMonotonicUpdates}
	>{nonMonotonicSnapshot}</output
>
