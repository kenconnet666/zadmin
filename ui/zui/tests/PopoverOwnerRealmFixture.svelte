<script lang="ts">
	import {
		ZPopover,
		ZPopoverContent,
		ZPopoverTrigger,
		ZProvider,
		type ZuiPortalContainer
	} from '../src/entrypoints/index.js';

	let { portalContainer }: { portalContainer?: ZuiPortalContainer } = $props();
	let open = $state(false);
</script>

<ZProvider motion="full" {portalContainer}>
	<div data-testid="popover-owner-inline-host">
		<ZPopover bind:open placement="bottom-start">
			<ZPopoverTrigger data-testid="popover-owner-trigger">Open owner-realm Popover</ZPopoverTrigger
			>
			<ZPopoverContent data-testid="popover-owner-content" aria-label="Owner realm popover">
				<div data-testid="popover-owner-content-body">Owner realm content</div>
			</ZPopoverContent>
		</ZPopover>
		<output data-testid="popover-owner-open">{open}</output>
	</div>
</ZProvider>
