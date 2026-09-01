<script lang="ts">
	import {
		ZButton,
		ZContextMenu,
		ZContextMenuContent,
		ZContextMenuTrigger,
		ZMenuItem,
		ZProvider,
		ZStack,
		ZText
	} from '@zadmin/zui';
	let open = $state(false);
</script>

<ZProvider direction="rtl" motion="reduced">
	<ZStack gap="medium">
		<ZButton variant="secondary" onclick={() => (open = false)}>从外部关闭</ZButton>
		<ZContextMenu bind:open>
			<ZContextMenuTrigger
				><ZText>RTL目标：右键、ContextMenu键或Shift+F10。</ZText></ZContextMenuTrigger
			>
			<ZContextMenuContent aria-label="RTL上下文菜单" placement="bottom-end">
				<ZMenuItem value="inspect">查看详情</ZMenuItem>
				<ZMenuItem danger value="delete">删除</ZMenuItem>
			</ZContextMenuContent>
		</ZContextMenu>
		<ZText tone="muted">open = {open}</ZText>
	</ZStack>
</ZProvider>
