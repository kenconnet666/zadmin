<script lang="ts">
	import { ZButton, ZPopover, ZPopoverContent, ZPopoverTrigger, ZStack, ZText } from '@zadmin/zui';

	let restoreRef = $state<HTMLButtonElement | null>(null);
	let attempts = $state(0);
</script>

<ZStack direction="row" gap="small" wrap>
	<ZPopover>
		<ZPopoverTrigger>打开受保护Popover</ZPopoverTrigger>
		<ZPopoverContent
			aria-label="受保护设置"
			ariaLabelledBy={null}
			restoreTarget={() => restoreRef}
			onEscape={(event) => {
				attempts += 1;
				event.preventDefault();
			}}
			onPointerOutside={(event) => {
				attempts += 1;
				event.preventDefault();
			}}
		>
			<ZText>显式aria-label、可取消dismiss和自定义restore target共享同一Content。</ZText>
		</ZPopoverContent>
	</ZPopover>
	<ZButton bind:ref={restoreRef} variant="secondary">恢复目标</ZButton>
</ZStack>
<ZText tone="muted">已阻止 {attempts} 次关闭请求。</ZText>
