<script lang="ts">
	import { untrack } from 'svelte';
	import ZMenubar from '../src/components/compound/menubar/ZMenubar.svelte';
	import ZMenubarMenu from '../src/components/compound/menubar/ZMenubarMenu.svelte';
	import ZMenubarTrigger from '../src/components/compound/menubar/ZMenubarTrigger.svelte';
	import ZMenubarContent from '../src/components/compound/menubar/ZMenubarContent.svelte';
	import ZMenuItem from '../src/components/compound/menu/ZMenuItem.svelte';
	import ZMenuCheckboxItem from '../src/components/compound/menu/ZMenuCheckboxItem.svelte';
	import ZMenuRadioGroup from '../src/components/compound/menu/ZMenuRadioGroup.svelte';
	import ZMenuRadioItem from '../src/components/compound/menu/ZMenuRadioItem.svelte';
	import ZMenuSub from '../src/components/compound/menu/ZMenuSub.svelte';
	import ZMenuSubTrigger from '../src/components/compound/menu/ZMenuSubTrigger.svelte';
	import ZMenuSubContent from '../src/components/compound/menu/ZMenuSubContent.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import type { SelectionKey } from '../src/runtime/collection/selection.js';

	let { defaultValue = null }: { defaultValue?: SelectionKey | null } = $props();
	let value = $state<SelectionKey | null>(untrack(() => defaultValue));
	let valueChanges = $state(0);
	let action = $state('none');
	let showEdit = $state(true);
	let editDisabled = $state(false);
	let checked = $state(false);
	let radio = $state<SelectionKey>('comfortable');
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;

	export function disableEdit(): void {
		editDisabled = true;
	}

	export function removeEdit(): void {
		showEdit = false;
	}
</script>

<button data-testid="menubar-before" type="button">Before menubar</button>
<ZProvider motion="reduced">
	<ZMenubar
		bind:value
		aria-label="Application commands"
		data-testid="menubar-root"
		onValueChange={() => (valueChanges += 1)}
		size="medium"
	>
		<ZMenubarMenu value="file">
			<ZMenubarTrigger data-testid="menubar-file-trigger">File</ZMenubarTrigger>
			<ZMenubarContent
				data-testid="menubar-file-content"
				onAction={(event) => (action = String(event.value))}
			>
				<ZMenuItem data-testid="menubar-file-first" value="new">New</ZMenuItem>
				<ZMenuCheckboxItem bind:checked data-testid="menubar-file-check" value="autosave"
					>Auto save</ZMenuCheckboxItem
				>
				<ZMenuItem data-testid="menubar-file-last" value="quit">Quit</ZMenuItem>
			</ZMenubarContent>
		</ZMenubarMenu>

		{#if showEdit}
			<ZMenubarMenu disabled={editDisabled} value="edit">
				<ZMenubarTrigger data-testid="menubar-edit-trigger">Edit</ZMenubarTrigger>
				<ZMenubarContent data-testid="menubar-edit-content">
					<ZMenuItem data-testid="menubar-edit-first" value="undo">Undo</ZMenuItem>
					<ZMenuItem data-testid="menubar-edit-last" value="redo">Redo</ZMenuItem>
				</ZMenubarContent>
			</ZMenubarMenu>
		{/if}

		<ZMenubarMenu value="view">
			<ZMenubarTrigger data-testid="menubar-view-trigger">View</ZMenubarTrigger>
			<ZMenubarContent data-testid="menubar-view-content">
				<ZMenuSub>
					<ZMenuSubTrigger data-testid="menubar-sub-trigger" value="density"
						>Density</ZMenuSubTrigger
					>
					<ZMenuSubContent data-testid="menubar-sub-content">
						<ZMenuRadioGroup aria-label="Density" bind:value={radio}>
							<ZMenuRadioItem data-testid="menubar-radio-compact" value="compact"
								>Compact</ZMenuRadioItem
							>
							<ZMenuRadioItem data-testid="menubar-radio-comfortable" value="comfortable"
								>Comfortable</ZMenuRadioItem
							>
						</ZMenuRadioGroup>
					</ZMenuSubContent>
				</ZMenuSub>
				<ZMenuItem data-testid="menubar-view-last" value="fullscreen">Full screen</ZMenuItem>
			</ZMenubarContent>
		</ZMenubarMenu>
	</ZMenubar>
</ZProvider>
<button data-testid="menubar-after" type="button">After menubar</button>

<ZProvider direction="rtl" motion="reduced">
	<ZMenubar aria-label="RTL commands" data-testid="menubar-rtl">
		<ZMenubarMenu value="rtl-first">
			<ZMenubarTrigger data-testid="menubar-rtl-first">First</ZMenubarTrigger>
			<ZMenubarContent><ZMenuItem value="rtl-a">A</ZMenuItem></ZMenubarContent>
		</ZMenubarMenu>
		<ZMenubarMenu value="rtl-last">
			<ZMenubarTrigger data-testid="menubar-rtl-last">Last</ZMenubarTrigger>
			<ZMenubarContent><ZMenuItem value="rtl-b">B</ZMenuItem></ZMenubarContent>
		</ZMenubarMenu>
	</ZMenubar>
</ZProvider>

<section data-testid="menubar-sizes">
	{#each sizes as size (size)}
		<ZMenubar aria-label={`Menubar ${size}`} {size}>
			<ZMenubarMenu value={size}>
				<ZMenubarTrigger data-testid={`menubar-size-${size}`}>{size}</ZMenubarTrigger>
			</ZMenubarMenu>
		</ZMenubar>
	{/each}
</section>

<output data-testid="menubar-output"
	>{String(value)}:{valueChanges}:{action}:{checked}:{String(radio)}</output
>
