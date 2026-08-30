<script lang="ts">
	import { ZInput, ZPopover, ZPopoverContent, ZPopoverTrigger, ZStack, ZText } from '@zadmin/zui';

	let input = $state<HTMLInputElement | null>(null);
</script>

<ZPopover matchWidth modal placement="bottom-start">
	<ZPopoverTrigger data-testid="popover-modal-trigger" variant="secondary"
		>配置发布权限</ZPopoverTrigger
	>
	<ZPopoverContent data-testid="popover-modal-content" initialFocus={() => input}>
		<ZStack gap="small">
			<ZText as="strong">发布权限</ZText>
			<ZInput aria-label="授权角色" bind:ref={input} defaultValue="release-manager" />
		</ZStack>
	</ZPopoverContent>
</ZPopover>
