<script lang="ts">
	import {
		ZProvider,
		ZAccordion,
		ZAccordionItem,
		ZAccordionTrigger,
		ZAccordionContent,
		ZTabs,
		ZTabsList,
		ZTabsTrigger,
		ZTabsPanel,
		ZMenu,
		ZMenuItem,
		ZPagination,
		ZCommand,
		ZCommandPalette,
		ZTree,
		ZDialog,
		ZDialogContent,
		ZDialogTitle,
		ZDrawer,
		ZDrawerContent,
		ZDrawerTitle,
		ZTooltip,
		ZTooltipTrigger,
		ZTooltipContent,
		type ZControlSize
	} from '../src/entrypoints/index.js';
	import { defaultTheme } from '../src/theme/default.js';
	import { extendTheme } from '../src/theme/define.js';

	let {
		size = 'medium',
		kind = 'collections',
		customHeight = false,
		cssVariableHeight = false,
		itemSize,
		externalResults = true
	}: {
		size?: ZControlSize;
		kind?: 'collections' | 'dialog' | 'drawer' | 'tooltip' | 'palette';
		customHeight?: boolean;
		cssVariableHeight?: boolean;
		itemSize?: number;
		externalResults?: boolean;
	} = $props();
	const nodes = [
		{ key: 'one', label: 'One' },
		{ key: 'two', label: 'Two' }
	];
	const items = [
		{ key: 'one', label: 'One' },
		{ key: 'two', label: 'Two' },
		{ key: 'three', label: 'Three' }
	];
	const theme = $derived(
		extendTheme(defaultTheme, {
			color: { inverseSurface: '#123456', inverseText: '#f0f0f0' },
			size: {
				tooltipMaxWidth: 180,
				...(cssVariableHeight
					? { medium: 'var(--tree-row-height)' }
					: customHeight
						? { medium: '2.75rem' }
						: {})
			}
		})
	);
</script>

<ZProvider {theme} motion="reduced">
	{#if kind === 'collections'}
		<ZAccordion {size}
			><ZAccordionItem value="one"
				><ZAccordionTrigger data-testid="size-accordion">Accordion</ZAccordionTrigger
				><ZAccordionContent>Details</ZAccordionContent></ZAccordionItem
			></ZAccordion
		>
		<ZTabs {size} defaultValue="one"
			><ZTabsList aria-label="Sized tabs"
				><ZTabsTrigger data-testid="size-tab" value="one">Tab</ZTabsTrigger></ZTabsList
			><ZTabsPanel value="one">Panel</ZTabsPanel></ZTabs
		>
		<ZMenu {size} aria-label="Sized menu"
			><ZMenuItem data-testid="size-menu" value="one">Menu item</ZMenuItem></ZMenu
		>
		<ZPagination {size} data-testid="size-pagination" totalItems={120} pageSizeOptions={[10, 20]} />
		<ZPagination {size} data-testid="size-pagination-simple" totalPages={12} mode="simple" />
		<ZCommand {size} {items} data-testid="size-command" />
		<ZTree {size} {nodes} data-testid="size-tree" aria-label="Sized tree" />
		<ZTree
			{size}
			{nodes}
			data-testid="size-virtual-tree"
			aria-label="Sized virtual tree"
			virtualized
			height={100}
			{itemSize}
		/>
	{:else if kind === 'dialog'}
		<ZDialog defaultOpen
			><ZDialogContent {size} data-testid="size-panel"
				><ZDialogTitle>Sized dialog</ZDialogTitle></ZDialogContent
			></ZDialog
		>
	{:else if kind === 'drawer'}
		<ZDrawer defaultOpen
			><ZDrawerContent {size} data-testid="size-panel"
				><ZDrawerTitle>Sized drawer</ZDrawerTitle></ZDrawerContent
			></ZDrawer
		>
	{:else if kind === 'tooltip'}
		<ZTooltip defaultOpen
			><ZTooltipTrigger>Tooltip</ZTooltipTrigger><ZTooltipContent {size} data-testid="size-tooltip"
				>{'unbroken-content-'.repeat(20)}</ZTooltipContent
			></ZTooltip
		>
	{:else}
		<ZCommandPalette
			{size}
			defaultOpen
			defaultQuery="not-present-in-labels"
			{items}
			shouldFilter={!externalResults}
			filter={(item) => item.key === 'two'}
			maxResults={2}
			loop={false}
			resultsLabel={(count) => `Custom results: ${count}`}
		/>
	{/if}
</ZProvider>
