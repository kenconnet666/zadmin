<script lang="ts">
	import ZAlertDialog from '../src/components/compound/alert-dialog/ZAlertDialog.svelte';
	import ZAlertDialogAction from '../src/components/compound/alert-dialog/ZAlertDialogAction.svelte';
	import ZAlertDialogCancel from '../src/components/compound/alert-dialog/ZAlertDialogCancel.svelte';
	import ZAlertDialogContent from '../src/components/compound/alert-dialog/ZAlertDialogContent.svelte';
	import ZAlertDialogDescription from '../src/components/compound/alert-dialog/ZAlertDialogDescription.svelte';
	import ZAlertDialogOverlay from '../src/components/compound/alert-dialog/ZAlertDialogOverlay.svelte';
	import ZAlertDialogTitle from '../src/components/compound/alert-dialog/ZAlertDialogTitle.svelte';
	import ZAlertDialogTrigger from '../src/components/compound/alert-dialog/ZAlertDialogTrigger.svelte';
	import ZDialog from '../src/components/compound/dialog/ZDialog.svelte';
	import ZDialogClose from '../src/components/compound/dialog/ZDialogClose.svelte';
	import ZDialogContent from '../src/components/compound/dialog/ZDialogContent.svelte';
	import ZDialogDescription from '../src/components/compound/dialog/ZDialogDescription.svelte';
	import ZDialogOverlay from '../src/components/compound/dialog/ZDialogOverlay.svelte';
	import ZDialogTitle from '../src/components/compound/dialog/ZDialogTitle.svelte';
	import ZDialogTrigger from '../src/components/compound/dialog/ZDialogTrigger.svelte';
	import ZPopover from '../src/components/compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../src/components/compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../src/components/compound/popover/ZPopoverTrigger.svelte';
	import ZButton from '../src/components/gene/ZButton.svelte';
	import ZInput from '../src/components/input/ZInput.svelte';

	let dialogOpen = $state(false);
	let inputRef = $state<HTMLInputElement | null>(null);
	let restoreRef = $state<HTMLButtonElement | null>(null);
	let alertOpen = $state(false);
	let resolveAction: (() => void) | undefined;
	let rejectAction: ((error: unknown) => void) | undefined;
	let actionErrors = $state(0);
	let popoverOpen = $state(false);

	function action(): Promise<void> {
		return new Promise((resolve, reject) => {
			resolveAction = resolve;
			rejectAction = reject;
		});
	}
</script>

<ZDialog bind:open={dialogOpen}>
	<ZDialogTrigger data-testid="dialog-production-trigger">Dialog</ZDialogTrigger>
	<ZDialogOverlay data-testid="dialog-production-overlay" />
	<ZDialogContent
		data-testid="dialog-production-content"
		initialFocus={() => inputRef}
		restoreTarget={() => restoreRef}
	>
		<ZDialogTitle data-testid="dialog-production-title">Dialog title</ZDialogTitle>
		<ZDialogDescription data-testid="dialog-production-description"
			>Dialog consequence.</ZDialogDescription
		>
		<ZInput aria-label="Dialog input" bind:ref={inputRef} />
		<ZDialogClose data-testid="dialog-production-close">Close</ZDialogClose>
	</ZDialogContent>
</ZDialog>
<ZButton bind:ref={restoreRef} data-testid="dialog-production-restore">Restore</ZButton>

<ZAlertDialog bind:open={alertOpen} onAction={action} onActionError={() => (actionErrors += 1)}>
	<ZAlertDialogTrigger data-testid="alert-production-trigger">Alert</ZAlertDialogTrigger>
	<ZAlertDialogOverlay data-testid="alert-production-overlay" />
	<ZAlertDialogContent data-testid="alert-production-content">
		<ZAlertDialogTitle data-testid="alert-production-title">Delete?</ZAlertDialogTitle>
		<ZAlertDialogDescription data-testid="alert-production-description"
			>Permanent consequence.</ZAlertDialogDescription
		>
		<ZAlertDialogCancel data-testid="alert-production-cancel">Cancel</ZAlertDialogCancel>
		<ZAlertDialogAction data-testid="alert-production-action">Delete</ZAlertDialogAction>
		<button data-testid="alert-production-resolve" onclick={() => resolveAction?.()}>Resolve</button
		>
		<button
			data-testid="alert-production-reject"
			onclick={() => rejectAction?.(new Error('failed'))}>Reject</button
		>
	</ZAlertDialogContent>
</ZAlertDialog>
<output data-testid="alert-production-output">{alertOpen}:{actionErrors}</output>

<ZPopover bind:open={popoverOpen}>
	<ZPopoverTrigger data-testid="popover-production-trigger">Popover</ZPopoverTrigger>
	<ZPopoverContent
		aria-label="Parent popover"
		ariaLabelledBy={null}
		data-testid="popover-production-content"
	>
		<ZPopover>
			<ZPopoverTrigger data-testid="popover-nested-trigger">Nested</ZPopoverTrigger>
			<ZPopoverContent aria-label="Nested popover" ariaLabelledBy={null}
				>Nested content</ZPopoverContent
			>
		</ZPopover>
	</ZPopoverContent>
</ZPopover>
<output data-testid="popover-production-output">{popoverOpen}</output>
