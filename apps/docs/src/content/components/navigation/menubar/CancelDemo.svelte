<script lang="ts">
	import {
		ZButton,
		ZMenuItem,
		ZMenubar,
		ZMenubarContent,
		ZMenubarMenu,
		ZMenubarTrigger,
		ZStack,
		ZText
	} from '@zadmin/zui';

	let cancel = $state(true);
	let output = $state('尚未执行命令');
</script>

<ZStack gap="small">
	<ZMenubar aria-label="可取消命令" onValueChange={(next) => (output = `open=${String(next)}`)}>
		<ZMenubarMenu value="actions">
			<ZMenubarTrigger>操作</ZMenubarTrigger>
			<ZMenubarContent
				onAction={(event) => {
					if (cancel) event.preventDefault();
					output = cancel ? 'action cancelled' : 'action accepted';
				}}
			>
				<ZMenuItem value="archive">归档</ZMenuItem>
				<ZMenuItem value="delete" danger>删除</ZMenuItem>
			</ZMenubarContent>
		</ZMenubarMenu>
	</ZMenubar>
	<ZButton type="button" variant="outline" onclick={() => (cancel = !cancel)}
		>cancel={cancel}</ZButton
	>
	<ZText tone="muted">{output}；取消action会保留菜单与焦点。</ZText>
</ZStack>
