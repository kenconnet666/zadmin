<script lang="ts">
	import { ZButton, ZPopover, ZPopoverContent, ZPopoverTrigger, ZStack, ZText } from '@zadmin/zui';

	let open = $state(false);
	let alternateTrigger = $state(false);
</script>

<ZStack direction="row" gap="small" wrap>
	<ZButton onclick={() => (open = true)}>外部打开</ZButton>
	<ZButton onclick={() => (open = false)} variant="secondary">外部关闭</ZButton>
	<ZButton onclick={() => (alternateTrigger = !alternateTrigger)} variant="ghost"
		>替换Trigger</ZButton
	>
	<ZPopover bind:open placement="bottom-start">
		{#if alternateTrigger}
			<ZPopoverTrigger>替代Trigger</ZPopoverTrigger>
		{:else}
			<ZPopoverTrigger>父Popover</ZPopoverTrigger>
		{/if}
		<ZPopoverContent>
			<ZText>父层内容</ZText>
			<ZPopover placement="right-start">
				<ZPopoverTrigger>打开子Popover</ZPopoverTrigger>
				<ZPopoverContent><ZText>子层是独立branch，Escape逐层关闭。</ZText></ZPopoverContent>
			</ZPopover>
		</ZPopoverContent>
	</ZPopover>
</ZStack>
<ZText tone="muted">open = {open}</ZText>
