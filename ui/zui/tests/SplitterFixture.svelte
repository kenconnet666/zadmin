<script lang="ts">
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZSplitter, {
		type ZSplitterCancelDetail,
		type ZSplitterPanel,
		type ZSplitterResizeDetail,
		type ZSplitterSize
	} from '../src/components/layout/ZSplitter.svelte';

	type MainKey = 'editor' | 'inspector' | 'sidebar';
	let mainPanels = $state.raw<readonly ZSplitterPanel<MainKey>[]>([
		{
			key: 'sidebar',
			label: 'Project files',
			min: '120px',
			max: '50%',
			collapsible: true,
			collapsedSize: '0px'
		},
		{ key: 'editor', label: 'Editor', min: 30 },
		{ key: 'inspector', label: 'Inspector', min: '8rem', max: '18rem' }
	]);
	let mainSizes = $state.raw<readonly ZSplitterSize[]>(['240px', 60, '12rem']);
	let starts = $state(0);
	let changes = $state(0);
	let ends = $state(0);
	let cancels = $state(0);
	let lastDetail = $state.raw<ZSplitterResizeDetail | ZSplitterCancelDetail | null>(null);
	let splitter: { reset(): void };

	const nestedPanels = [
		{ key: 'source', label: 'Source editor', min: 25 },
		{ key: 'terminal', label: 'Terminal', min: '4rem', collapsible: true }
	] as const satisfies readonly ZSplitterPanel[];
	const rtlPanels = [
		{ key: 1, label: 'RTL primary', min: 10 },
		{ key: '1', label: 'RTL secondary', min: 10 }
	] as const satisfies readonly ZSplitterPanel[];

	function remember(detail: ZSplitterResizeDetail | ZSplitterCancelDetail): void {
		lastDetail = detail;
	}
	function handleSizes(value: readonly ZSplitterSize[]): void {
		mainSizes = value;
		changes += 1;
	}
	export function setControlled(value: readonly ZSplitterSize[]): void {
		mainSizes = value;
	}
	export function reorder(): void {
		mainPanels = [mainPanels[1], mainPanels[0], mainPanels[2]];
		mainSizes = [mainSizes[1], mainSizes[0], mainSizes[2]];
	}
	export function resetThroughMember(): void {
		splitter.reset();
	}
</script>

{#snippet mainPanel(entry: ZSplitterPanel<MainKey>)}
	{#if entry.key === 'editor'}
		<ZSplitter
			data-testid="splitter-nested"
			defaultSizes={[65, 35]}
			orientation="vertical"
			panel={nestedPanel}
			panels={nestedPanels}
			style="height:100%;min-height:0"
		/>
	{:else if entry.key === 'sidebar'}
		<nav aria-label="Project tree"><button>src</button><button>tests</button></nav>
	{:else}
		<aside>Properties</aside>
	{/if}
{/snippet}

{#snippet nestedPanel(entry: ZSplitterPanel)}
	<div data-testid={`nested-${String(entry.key)}`}>{entry.label}</div>
{/snippet}

{#snippet rtlPanel(entry: ZSplitterPanel)}
	<div>{entry.label}</div>
{/snippet}

<ZSplitter
	bind:this={splitter}
	bind:sizes={mainSizes}
	data-testid="splitter-main"
	defaultSizes={['240px', 60, '12rem']}
	onResize={(detail) => remember(detail)}
	onResizeCancel={(detail) => {
		cancels += 1;
		remember(detail);
	}}
	onResizeEnd={(detail) => {
		ends += 1;
		remember(detail);
	}}
	onResizeStart={(detail) => {
		starts += 1;
		remember(detail);
	}}
	onSizesChange={handleSizes}
	panel={mainPanel}
	panels={mainPanels}
	style="width:900px;height:360px"
/>

<output
	data-cancels={cancels}
	data-changes={changes}
	data-ends={ends}
	data-frozen={lastDetail
		? Object.isFrozen(lastDetail) &&
			Object.isFrozen(lastDetail.sizes) &&
			Object.isFrozen(lastDetail.pixels) &&
			Object.isFrozen(lastDetail.percentages)
		: undefined}
	data-reason={lastDetail && 'reason' in lastDetail ? lastDetail.reason : undefined}
	data-source={lastDetail?.source}
	data-starts={starts}
	data-testid="splitter-events">{mainSizes.join('|')}</output
>

<ZProvider direction="rtl">
	<ZSplitter
		data-testid="splitter-rtl"
		defaultSizes={[30, 70]}
		panel={rtlPanel}
		panels={rtlPanels}
		style="width:500px;height:120px"
	/>
</ZProvider>
