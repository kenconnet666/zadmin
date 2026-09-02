<script lang="ts">
	import {
		ZAlertDialog,
		ZAlertDialogAction,
		ZAlertDialogCancel,
		ZAlertDialogContent,
		ZAlertDialogDescription,
		ZAlertDialogOverlay,
		ZAlertDialogTitle,
		ZAlertDialogTrigger,
		ZText
	} from '@zadmin/zui';

	let error = $state('尚未执行');
</script>

<ZAlertDialog
	onAction={() => Promise.reject(new Error('仍有运行中的部署引用该制品'))}
	onActionError={(reason) => (error = reason instanceof Error ? reason.message : '删除失败')}
>
	<ZAlertDialogTrigger>模拟失败</ZAlertDialogTrigger>
	<ZAlertDialogOverlay />
	<ZAlertDialogContent>
		<ZAlertDialogTitle>删除生产制品？</ZAlertDialogTitle>
		<ZAlertDialogDescription
			>reject后保持打开、解除pending并把焦点恢复到Action。</ZAlertDialogDescription
		>
		<ZText aria-live="polite" tone={error === '尚未执行' ? 'muted' : 'danger'}>{error}</ZText>
		<ZAlertDialogCancel>取消</ZAlertDialogCancel>
		<ZAlertDialogAction>确认删除</ZAlertDialogAction>
	</ZAlertDialogContent>
</ZAlertDialog>
