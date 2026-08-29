<script lang="ts">
	import ZPopover from '../src/components/compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../src/components/compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../src/components/compound/popover/ZPopoverTrigger.svelte';

	let { defaultOpen = false }: { defaultOpen?: boolean } = $props();
	let open = $state<boolean>();
	let changes = $state(0);
</script>

<div data-testid="popover-inline-host">
	<ZPopover {defaultOpen} bind:open onOpenChange={() => (changes += 1)} placement="bottom-start">
		<ZPopoverTrigger data-testid="popover-trigger">Open</ZPopoverTrigger>
		<ZPopoverContent data-testid="popover-content">
			<input aria-label="Inside" />
		</ZPopoverContent>
	</ZPopover>
</div>
<button data-testid="popover-outside">Outside</button>
<output data-testid="popover-output">{open}:{changes}</output>
