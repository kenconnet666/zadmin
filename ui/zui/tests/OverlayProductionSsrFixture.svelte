<script lang="ts">
	import ZAlertDialog from '../src/components/compound/alert-dialog/ZAlertDialog.svelte';
	import ZAlertDialogAction from '../src/components/compound/alert-dialog/ZAlertDialogAction.svelte';
	import ZAlertDialogCancel from '../src/components/compound/alert-dialog/ZAlertDialogCancel.svelte';
	import ZAlertDialogContent from '../src/components/compound/alert-dialog/ZAlertDialogContent.svelte';
	import ZAlertDialogDescription from '../src/components/compound/alert-dialog/ZAlertDialogDescription.svelte';
	import ZAlertDialogOverlay from '../src/components/compound/alert-dialog/ZAlertDialogOverlay.svelte';
	import ZAlertDialogTitle from '../src/components/compound/alert-dialog/ZAlertDialogTitle.svelte';
	import ZDialog from '../src/components/compound/dialog/ZDialog.svelte';
	import ZDialogContent from '../src/components/compound/dialog/ZDialogContent.svelte';
	import ZDialogTitle from '../src/components/compound/dialog/ZDialogTitle.svelte';
	import ZPopover from '../src/components/compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../src/components/compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../src/components/compound/popover/ZPopoverTrigger.svelte';
</script>

<ZDialog defaultOpen>
	<ZDialogContent ariaDescribedBy={null}><ZDialogTitle>SSR dialog</ZDialogTitle></ZDialogContent>
</ZDialog>
<ZAlertDialog defaultOpen>
	<ZAlertDialogOverlay />
	<ZAlertDialogContent>
		<ZAlertDialogTitle>SSR alert</ZAlertDialogTitle>
		<ZAlertDialogDescription>SSR consequence</ZAlertDialogDescription>
		<ZAlertDialogCancel>Cancel</ZAlertDialogCancel>
		<ZAlertDialogAction>Action</ZAlertDialogAction>
	</ZAlertDialogContent>
</ZAlertDialog>
<ZPopover defaultOpen>
	<ZPopoverTrigger>SSR popover trigger</ZPopoverTrigger>
	<ZPopoverContent aria-label="SSR popover" ariaLabelledBy={null}>Content</ZPopoverContent>
</ZPopover>
