<script lang="ts">
	import ZToolbar from '../src/components/compound/toolbar/ZToolbar.svelte';
	import ZToolbarItem from '../src/components/compound/toolbar/ZToolbarItem.svelte';
	import ZPopover from '../src/components/compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../src/components/compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../src/components/compound/popover/ZPopoverTrigger.svelte';
	import ZButton from '../src/components/gene/ZButton.svelte';
	import ZLink from '../src/components/gene/ZLink.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZOverflowList, {
		type OverflowListState
	} from '../src/components/layout/ZOverflowList.svelte';

	let showMiddle = $state(true);
	let saveDisabled = $state(false);
	let saveCount = $state(0);
	let cancelledKeys = $state(0);
	let toolbarOverflowWidth = $state(220);
	let toolbarOverflowOpen = $state(false);
	const toolbarOverflowItems = [
		{ key: 'overflow-one', label: 'One' },
		{ key: 'overflow-two', label: 'Two' },
		{ key: 'overflow-three', label: 'Three' },
		{ key: 'overflow-four', label: 'Four' }
	] as const;

	export function removeMiddle(): void {
		showMiddle = false;
	}

	export function disableSave(): void {
		saveDisabled = true;
	}

	export function setToolbarOverflowWidth(next: number): void {
		toolbarOverflowWidth = next;
	}
</script>

{#snippet overflowToolbarItem(entry: (typeof toolbarOverflowItems)[number])}
	<ZToolbarItem value={entry.key}>
		{#snippet children(props)}
			<button
				{...props}
				data-testid={`toolbar-${entry.key}`}
				style="box-sizing: border-box; inline-size: 100px"
				type="button">{entry.label}</button
			>
		{/snippet}
	</ZToolbarItem>
{/snippet}

{#snippet overflowToolbarTrigger(state: OverflowListState<(typeof toolbarOverflowItems)[number]>)}
	<ZToolbarItem value="overflow-more">
		{#snippet children(props)}
			<ZPopoverTrigger
				{...props}
				aria-label="More toolbar actions"
				data-overflow-count={state.overflowItems.length}
				shape="square"
				size="small"
				variant="ghost">More</ZPopoverTrigger
			>
		{/snippet}
	</ZToolbarItem>
{/snippet}

<ZToolbar aria-label="Editor toolbar" gap={10} size="small">
	<ZToolbarItem disabled={saveDisabled} value="save">
		{#snippet children(props)}
			<ZButton {...props} data-testid="toolbar-save" onclick={() => (saveCount += 1)} size="xsmall"
				>Save</ZButton
			>
		{/snippet}
	</ZToolbarItem>
	{#if showMiddle}
		<ZToolbarItem value="middle">
			{#snippet children(props)}
				<button {...props} data-testid="toolbar-middle" type="button">Middle</button>
			{/snippet}
		</ZToolbarItem>
	{/if}
	<ZToolbarItem disabled value="disabled-command">
		{#snippet children(props)}
			<button {...props} data-testid="toolbar-disabled" type="button">Disabled</button>
		{/snippet}
	</ZToolbarItem>
	<ZToolbarItem keyPolicy="control" value="font-size">
		{#snippet children(props)}
			<input
				{...props}
				aria-label="Font size"
				data-testid="toolbar-number"
				type="number"
				value="5"
			/>
		{/snippet}
	</ZToolbarItem>
	<ZToolbarItem value="after-input">
		{#snippet children(props)}
			<button {...props} data-testid="toolbar-after-input" type="button">After input</button>
		{/snippet}
	</ZToolbarItem>
	<ZToolbarItem keyPolicy="control" value="search">
		{#snippet children(props)}
			<input
				{...props}
				aria-label="Search commands"
				data-testid="toolbar-search"
				type="text"
				value="query"
			/>
		{/snippet}
	</ZToolbarItem>
</ZToolbar>

<ZToolbar aria-label="Link toolbar">
	<ZToolbarItem value="docs">
		{#snippet children(props)}
			<a {...props} data-testid="toolbar-native-link" href="#toolbar-docs">Docs</a>
		{/snippet}
	</ZToolbarItem>
	<ZToolbarItem disabled value="disabled-link">
		{#snippet children(props)}
			<ZLink {...props} data-testid="toolbar-disabled-link" href="#toolbar-disabled-link"
				>Disabled docs</ZLink
			>
		{/snippet}
	</ZToolbarItem>
</ZToolbar>

<ZToolbar aria-label="RTL toolbar" dir="rtl">
	<ZToolbarItem value="rtl-first">
		{#snippet children(props)}
			<button {...props} data-testid="toolbar-rtl-first" type="button">First</button>
		{/snippet}
	</ZToolbarItem>
	<ZToolbarItem value="rtl-last">
		{#snippet children(props)}
			<button {...props} data-testid="toolbar-rtl-last" type="button">Last</button>
		{/snippet}
	</ZToolbarItem>
</ZToolbar>

<ZToolbar aria-label="Vertical toolbar" loop={false} orientation="vertical">
	<ZToolbarItem value="vertical-first">
		{#snippet children(props)}
			<button {...props} data-testid="toolbar-vertical-first" type="button">First</button>
		{/snippet}
	</ZToolbarItem>
	<ZToolbarItem value="vertical-last">
		{#snippet children(props)}
			<button {...props} data-testid="toolbar-vertical-last" type="button">Last</button>
		{/snippet}
	</ZToolbarItem>
</ZToolbar>

<ZToolbar
	aria-label="Cancelled toolbar"
	onkeydown={(event) => {
		if (event.key !== 'ArrowRight') return;
		cancelledKeys += 1;
		event.preventDefault();
	}}
>
	<ZToolbarItem value="cancelled-first">
		{#snippet children(props)}
			<button {...props} data-testid="toolbar-cancelled-first" type="button">First</button>
		{/snippet}
	</ZToolbarItem>
	<ZToolbarItem value="cancelled-last">
		{#snippet children(props)}
			<button {...props} data-testid="toolbar-cancelled-last" type="button">Last</button>
		{/snippet}
	</ZToolbarItem>
</ZToolbar>

<ZProvider componentDefaults={{ toolbar: { size: 'large' } }}>
	<ZToolbar aria-label="Provider toolbar">
		<ZToolbarItem value="provider-command">
			{#snippet children(props)}
				<ZButton {...props} data-testid="toolbar-provider-command">Provider</ZButton>
			{/snippet}
		</ZToolbarItem>
	</ZToolbar>
</ZProvider>

<ZToolbar aria-label="Outer toolbar">
	<ZToolbarItem value="outer-first">
		{#snippet children(props)}
			<button {...props} data-testid="toolbar-outer-first" type="button">Outer first</button>
		{/snippet}
	</ZToolbarItem>
	<ZToolbar aria-label="Inner toolbar">
		<ZToolbarItem value="inner-first">
			{#snippet children(props)}
				<button {...props} data-testid="toolbar-inner-first" type="button">Inner first</button>
			{/snippet}
		</ZToolbarItem>
		<ZToolbarItem value="inner-last">
			{#snippet children(props)}
				<button {...props} data-testid="toolbar-inner-last" type="button">Inner last</button>
			{/snippet}
		</ZToolbarItem>
	</ZToolbar>
	<ZToolbarItem value="outer-last">
		{#snippet children(props)}
			<button {...props} data-testid="toolbar-outer-last" type="button">Outer last</button>
		{/snippet}
	</ZToolbarItem>
</ZToolbar>

<ZToolbar aria-label="Overflow toolbar">
	<ZPopover bind:open={toolbarOverflowOpen} modal={false} placement="bottom-start">
		<div data-testid="toolbar-overflow-owner" style={`width: ${toolbarOverflowWidth}px`}>
			<ZOverflowList
				collapseFrom="end"
				data-testid="toolbar-overflow-list"
				gap={8}
				item={overflowToolbarItem}
				itemKey={(entry) => entry.key}
				items={toolbarOverflowItems}
				maxRows={1}
				overflow={overflowToolbarTrigger}
				suspended={toolbarOverflowOpen}
			/>
		</div>
		<ZPopoverContent aria-label="More toolbar actions">
			<button data-testid="toolbar-overflow-menu-action" type="button">Hidden action</button>
		</ZPopoverContent>
	</ZPopover>
</ZToolbar>

<button data-testid="toolbar-external-focus" type="button">External focus</button>
<output data-testid="toolbar-output">{saveCount}|{cancelledKeys}</output>
