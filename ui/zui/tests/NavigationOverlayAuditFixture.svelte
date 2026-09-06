<script lang="ts">
	import { untrack } from 'svelte';
	import {
		ZAccordion,
		ZAccordionContent,
		ZAccordionItem,
		ZAccordionTrigger,
		ZCommand,
		ZDialog,
		ZDialogContent,
		ZDialogOverlay,
		ZDialogTitle,
		ZDialogTrigger,
		ZPopover,
		ZPopoverContent,
		ZPopoverTrigger,
		ZProvider,
		ZTooltip,
		ZTooltipContent,
		ZTooltipTrigger,
		ZTree
	} from '../src/entrypoints/index.js';
	import { defaultTheme } from '../src/theme/default.js';
	import { extendTheme } from '../src/theme/define.js';

	let {
		initiallyOpen = false,
		kind = 'dialog',
		motion = 'full'
	}: {
		initiallyOpen?: boolean;
		kind?: 'accordion' | 'dialog' | 'disabled' | 'popover' | 'tooltip';
		motion?: 'full' | 'reduced';
	} = $props();
	let open = $state(untrack(() => initiallyOpen));
	let disabled = $state(false);
	const theme = extendTheme(defaultTheme, { duration: { fast: 400, normal: 400 } });
	const longText = 'long-unbroken-tooltip-or-popover-content'.repeat(18);

	export function setOpen(next: boolean): void {
		open = next;
	}
	export function disableAll(): void {
		disabled = true;
	}
</script>

<ZProvider {motion} {theme}>
	{#if kind === 'disabled'}
		<ZTree
			aria-label="Disabled visual audit tree"
			data-testid="disabled-tree"
			{disabled}
			nodes={[
				{ key: 'enabled', label: 'Enabled node' },
				{ key: 'disabled', label: 'Disabled node', disabled: true }
			]}
		/>
		<ZCommand
			data-testid="disabled-command"
			{disabled}
			items={[
				{ key: 'enabled', label: 'Enabled command' },
				{ key: 'disabled', label: 'Disabled command', disabled: true }
			]}
		/>
	{:else if kind === 'accordion'}
		<ZAccordion value={open ? 'entry' : null}>
			<ZAccordionItem value="entry">
				<ZAccordionTrigger>Entry accordion</ZAccordionTrigger>
				<ZAccordionContent data-testid="entry-content">Entry content</ZAccordionContent>
			</ZAccordionItem>
		</ZAccordion>
	{:else if kind === 'dialog'}
		<ZDialog {open}>
			<ZDialogTrigger>Entry dialog</ZDialogTrigger>
			<ZDialogOverlay data-testid="entry-overlay" />
			<ZDialogContent data-testid="entry-content">
				<ZDialogTitle>Entry dialog</ZDialogTitle>
				Entry content
			</ZDialogContent>
		</ZDialog>
	{:else if kind === 'popover'}
		<ZPopover {open}>
			<ZPopoverTrigger>Entry popover</ZPopoverTrigger>
			<ZPopoverContent data-testid="entry-content">{longText}</ZPopoverContent>
		</ZPopover>
	{:else}
		<ZTooltip {open}>
			<ZTooltipTrigger>Entry tooltip</ZTooltipTrigger>
			<ZTooltipContent data-testid="entry-content">{longText}</ZTooltipContent>
		</ZTooltip>
	{/if}
</ZProvider>
