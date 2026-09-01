<script lang="ts">
	import {
		ZButton,
		ZDropdownMenu,
		ZDropdownMenuContent,
		ZDropdownMenuTrigger,
		ZMenuItem,
		ZProvider,
		ZStack,
		ZText
	} from '@zadmin/zui';
	let open = $state(false);
	let changes = $state(0);
</script>

<ZProvider motion="reduced">
	<ZStack direction="row" gap="medium" wrap>
		<ZButton variant="secondary" onclick={() => (open = !open)}>
			外部{open ? '关闭' : '打开'}
		</ZButton>
		<ZDropdownMenu bind:open onOpenChange={() => (changes += 1)}>
			<ZDropdownMenuTrigger variant="secondary">受控菜单</ZDropdownMenuTrigger>
			<ZDropdownMenuContent>
				<ZMenuItem value="inspect">查看详情</ZMenuItem>
				<ZMenuItem
					href="https://ant.design/components/menu/"
					rel="noreferrer"
					target="_blank"
					value="docs"
				>
					参考文档
				</ZMenuItem>
			</ZDropdownMenuContent>
		</ZDropdownMenu>
	</ZStack>
	<ZText tone="muted">open = {open} · user changes = {changes}</ZText>
</ZProvider>
