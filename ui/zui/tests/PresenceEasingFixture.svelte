<script lang="ts">
	import {
		ZDialog,
		ZDialogContent,
		ZDialogClose,
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
		defaultTheme,
		defineTheme
	} from '../src/entrypoints/index.js';

	const customTheme = defineTheme({
		...defaultTheme,
		easing: {
			...defaultTheme.easing,
			enter: 'cubic-bezier(0.11, 0.22, 0.33, 0.44)',
			exit: 'cubic-bezier(0.55, 0.66, 0.77, 0.88)'
		}
	});
</script>

<ZProvider theme={customTheme}>
	<ZDialog defaultOpen>
		<ZDialogTrigger data-testid="presence-dialog-trigger">Toggle dialog</ZDialogTrigger>
		<ZDialogOverlay data-testid="presence-dialog-overlay" />
		<ZDialogContent data-testid="presence-dialog-content">
			<ZDialogTitle>Presence dialog</ZDialogTitle>
			<p>Dialog content</p>
			<ZDialogClose data-testid="presence-dialog-close">Close</ZDialogClose>
		</ZDialogContent>
	</ZDialog>

	<ZPopover defaultOpen>
		<ZPopoverTrigger data-testid="presence-popover-trigger">Popover</ZPopoverTrigger>
		<ZPopoverContent data-testid="presence-popover-content">Popover content</ZPopoverContent>
	</ZPopover>

	<ZTooltip defaultOpen>
		<ZTooltipTrigger data-testid="presence-tooltip-trigger">Tooltip</ZTooltipTrigger>
		<ZTooltipContent data-testid="presence-tooltip-content">Tooltip content</ZTooltipContent>
	</ZTooltip>
</ZProvider>
