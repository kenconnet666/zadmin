<script lang="ts">
	import {
		ZMenuItem,
		ZMenubar,
		ZMenubarContent,
		ZMenubarMenu,
		ZMenubarTrigger,
		ZText
	} from '@zadmin/zui';
</script>

<ZMenubar aria-label="编辑命令">
	<ZMenubarMenu value="file">
		<ZMenubarTrigger>文件</ZMenubarTrigger>
		<ZMenubarContent>
			<ZMenuItem value="new">新建</ZMenuItem>
			<ZMenuItem value="open">打开</ZMenuItem>
			<ZMenuItem value="save">保存</ZMenuItem>
		</ZMenubarContent>
	</ZMenubarMenu>
	<ZMenubarMenu value="edit">
		<ZMenubarTrigger>编辑</ZMenubarTrigger>
		<ZMenubarContent>
			<ZMenuItem value="undo">撤销</ZMenuItem>
			<ZMenuItem value="redo">重做</ZMenuItem>
		</ZMenubarContent>
	</ZMenubarMenu>
</ZMenubar>
<ZText tone="muted">左右键切换根菜单，ArrowDown打开并聚焦首项，Escape恢复trigger。</ZText>
