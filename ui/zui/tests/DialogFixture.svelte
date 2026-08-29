<script lang="ts">
	import ZDialog from '../src/components/compound/dialog/ZDialog.svelte';
	import ZDialogClose from '../src/components/compound/dialog/ZDialogClose.svelte';
	import ZDialogContent from '../src/components/compound/dialog/ZDialogContent.svelte';
	import ZDialogDescription from '../src/components/compound/dialog/ZDialogDescription.svelte';
	import ZDialogOverlay from '../src/components/compound/dialog/ZDialogOverlay.svelte';
	import ZDialogTitle from '../src/components/compound/dialog/ZDialogTitle.svelte';
	import ZDialogTrigger from '../src/components/compound/dialog/ZDialogTrigger.svelte';

	let { defaultOpen = false }: { defaultOpen?: boolean } = $props();
	let open = $state(defaultOpen);
	let changes = $state(0);
</script>

<div data-testid="dialog-inline-host">
	<ZDialog {defaultOpen} bind:open onOpenChange={() => (changes += 1)}>
		<ZDialogTrigger data-testid="dialog-trigger">Open dialog</ZDialogTrigger>
		<ZDialogOverlay data-testid="dialog-overlay" />
		<ZDialogContent data-testid="dialog-content">
			<ZDialogTitle>Fixture dialog</ZDialogTitle>
			<ZDialogDescription>Fixture description</ZDialogDescription>
			<input aria-label="Dialog input" name="dialog-input" />
			<ZDialogClose data-testid="dialog-close">Close</ZDialogClose>
		</ZDialogContent>
	</ZDialog>
	<output data-testid="dialog-output">{open}:{changes}</output>
</div>
