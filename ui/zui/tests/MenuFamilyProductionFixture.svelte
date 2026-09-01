<script lang="ts">
	import {
		ZButton,
		ZContextMenu,
		ZContextMenuContent,
		ZContextMenuTrigger,
		ZDropdownMenu,
		ZDropdownMenuContent,
		ZDropdownMenuTrigger,
		ZMenu,
		ZMenuCheckboxItem,
		ZMenuGroup,
		ZMenuItem,
		ZMenuLabel,
		ZMenuRadioGroup,
		ZMenuRadioItem,
		ZMenuSeparator,
		ZMenuSub,
		ZMenuSubContent,
		ZMenuSubTrigger,
		ZProvider
	} from '../src/entrypoints/index.js';

	let showMiddle = $state(true);
	let checked = $state<boolean | 'mixed'>('mixed');
	let blockedChecked = $state(false);
	let radio = $state<string | number>('one');
	let dropdownOpen = $state(false);
	let contextOpen = $state(false);
	let action = $state('none');
	let cancelled = $state(0);
</script>

<ZButton data-testid="menu-remove" onclick={() => (showMiddle = !showMiddle)}>Toggle middle</ZButton
>
<ZMenu
	aria-label="Production menu"
	onAction={(event) => {
		if (event.value === 'blocked-check') event.preventDefault();
		else action = String(event.value);
	}}
>
	<ZMenuGroup value="primary">
		<ZMenuLabel>Primary</ZMenuLabel>
		<ZMenuItem data-testid="menu-first" value="first">Alpha</ZMenuItem>
		{#if showMiddle}<ZMenuItem data-testid="menu-middle" value="middle">Bravo</ZMenuItem>{/if}
		<ZMenuItem data-testid="menu-last" value="last">Charlie</ZMenuItem>
	</ZMenuGroup>
	<ZMenuSeparator />
	<ZMenuCheckboxItem bind:checked data-testid="menu-check" value="check">Grid</ZMenuCheckboxItem>
	<ZMenuCheckboxItem
		bind:checked={blockedChecked}
		data-testid="menu-check-blocked"
		value="blocked-check"
	>
		Blocked toggle
	</ZMenuCheckboxItem>
	<ZMenuRadioGroup aria-label="Typed radio" bind:value={radio}>
		<ZMenuRadioItem data-testid="menu-radio-number" value={1}>Number one</ZMenuRadioItem>
		<ZMenuRadioItem data-testid="menu-radio-string" value="1">String one</ZMenuRadioItem>
	</ZMenuRadioGroup>
	<ZMenuItem
		data-testid="menu-link-cancelled"
		href="#menu-should-not-navigate"
		onSelect={(event) => {
			cancelled += 1;
			event.preventDefault();
		}}
		shortcut="Ctrl+L"
		value="link"
	>
		Protected link
	</ZMenuItem>
</ZMenu>

<ZDropdownMenu bind:open={dropdownOpen}>
	<ZDropdownMenuTrigger data-testid="dropdown-trigger">Actions</ZDropdownMenuTrigger>
	<ZDropdownMenuContent
		data-testid="dropdown-content"
		onAction={(event) => (action = `dropdown:${String(event.value)}`)}
	>
		<ZMenuItem data-testid="dropdown-first" value="inspect">Inspect</ZMenuItem>
		<ZMenuCheckboxItem data-testid="dropdown-check" value="pin">Pin</ZMenuCheckboxItem>
		<ZMenuSub>
			<ZMenuSubTrigger data-testid="dropdown-sub-trigger" value="share">Share</ZMenuSubTrigger>
			<ZMenuSubContent data-testid="dropdown-sub-content">
				<ZMenuItem data-testid="dropdown-sub-item" value="mail">Mail</ZMenuItem>
				<ZMenuItem data-testid="dropdown-sub-last" value="copy">Copy link</ZMenuItem>
			</ZMenuSubContent>
		</ZMenuSub>
		<ZMenuItem data-testid="dropdown-last" value="delete">Delete</ZMenuItem>
	</ZDropdownMenuContent>
</ZDropdownMenu>

<ZContextMenu bind:open={contextOpen}>
	<ZContextMenuTrigger data-testid="context-trigger">Context target</ZContextMenuTrigger>
	<ZContextMenuContent aria-label="Production context" data-testid="context-content">
		<ZMenuItem data-testid="context-first" value="open">Open</ZMenuItem>
		<ZMenuItem data-testid="context-last" value="remove">Remove</ZMenuItem>
	</ZContextMenuContent>
</ZContextMenu>

<ZProvider direction="rtl">
	<ZContextMenu>
		<ZContextMenuTrigger data-testid="context-rtl-trigger">RTL target</ZContextMenuTrigger>
		<ZContextMenuContent aria-label="RTL context" data-testid="context-rtl-content">
			<ZMenuItem value="rtl-open">Open</ZMenuItem>
		</ZContextMenuContent>
	</ZContextMenu>
</ZProvider>

<output data-testid="menu-state">
	{showMiddle}:{String(checked)}:{blockedChecked}:{String(
		radio
	)}:{dropdownOpen}:{contextOpen}:{action}:{cancelled}
</output>
