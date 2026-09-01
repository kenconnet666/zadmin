<script lang="ts">
	import { ZMenu, ZMenuItem, ZMenuSub, ZMenuSubContent, ZMenuSubTrigger, ZText } from '@zadmin/zui';
	let action = $state('none');
</script>

<ZMenu aria-label="导出动作" onAction={(event) => (action = String(event.value))}>
	<ZMenuItem value="quick">快速导出</ZMenuItem>
	<ZMenuSub>
		<ZMenuSubTrigger value="export-as">导出为</ZMenuSubTrigger>
		<ZMenuSubContent>
			<ZMenuItem value="png">PNG图片</ZMenuItem>
			<ZMenuItem value="pdf">PDF文档</ZMenuItem>
			<ZMenuSub>
				<ZMenuSubTrigger value="source">源文件</ZMenuSubTrigger>
				<ZMenuSubContent>
					<ZMenuItem value="json">JSON</ZMenuItem>
					<ZMenuItem value="yaml">YAML</ZMenuItem>
				</ZMenuSubContent>
			</ZMenuSub>
		</ZMenuSubContent>
	</ZMenuSub>
</ZMenu>
<ZText tone="muted">action = {action}</ZText>
