<script lang="ts">
	import {
		ZDialog,
		ZDialogClose,
		ZDialogContent,
		ZDialogDescription,
		ZDialogOverlay,
		ZDialogTitle,
		ZDialogTrigger,
		ZText
	} from '@zadmin/zui';

	let attempts = $state(0);
</script>

<ZDialog>
	<ZDialogTrigger>打开不可意外关闭的草稿</ZDialogTrigger>
	<ZDialogOverlay />
	<ZDialogContent
		onEscape={(event) => {
			attempts += 1;
			event.preventDefault();
		}}
		onPointerOutside={(event) => {
			attempts += 1;
			event.preventDefault();
		}}
	>
		<ZDialogTitle>未保存草稿</ZDialogTitle>
		<ZDialogDescription>Escape与outside事件可观察并取消，只有显式按钮关闭。</ZDialogDescription>
		<ZText tone="muted">已阻止 {attempts} 次关闭请求。</ZText>
		<ZDialogClose>放弃并关闭</ZDialogClose>
	</ZDialogContent>
</ZDialog>
