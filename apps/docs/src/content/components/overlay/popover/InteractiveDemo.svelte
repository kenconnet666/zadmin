<script lang="ts">
	import { ZInput, ZPopover, ZPopoverContent, ZPopoverTrigger, ZStack, ZText } from '@zadmin/zui';

	let open = $state(false);
	let changes = $state(0);
</script>

<ZPopover bind:open onOpenChange={() => (changes += 1)} placement="bottom-start">
	<ZPopoverTrigger data-testid="popover-trigger" variant="secondary">部署详情</ZPopoverTrigger>
	<ZPopoverContent data-testid="popover-content">
		<ZStack gap="small">
			<ZText as="strong">生产部署</ZText>
			<ZText tone="muted">提交 2594d05 · 健康检查通过</ZText>
			<ZInput aria-label="部署备注" placeholder="添加备注" />
		</ZStack>
	</ZPopoverContent>
</ZPopover>
<ZText tone="muted">open = {open} · 用户变更次数 = {changes}</ZText>
