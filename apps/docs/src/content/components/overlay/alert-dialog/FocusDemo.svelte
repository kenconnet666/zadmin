<script lang="ts">
	import {
		ZAlertDialog,
		ZAlertDialogAction,
		ZAlertDialogCancel,
		ZAlertDialogContent,
		ZAlertDialogDescription,
		ZAlertDialogOverlay,
		ZAlertDialogTitle,
		ZAlertDialogTrigger
	} from '@zadmin/zui';
</script>

<ZAlertDialog>
	<ZAlertDialogTrigger>检查默认焦点</ZAlertDialogTrigger>
	<ZAlertDialogOverlay />
	<ZAlertDialogContent>
		<ZAlertDialogTitle>永久删除账户？</ZAlertDialogTitle>
		<ZAlertDialogDescription>
			此操作会删除成员、密钥和审计记录，无法撤销。默认焦点位于取消，而不是危险Action。
		</ZAlertDialogDescription>
		<ZAlertDialogCancel>保留账户</ZAlertDialogCancel>
		<ZAlertDialogAction>永久删除</ZAlertDialogAction>
	</ZAlertDialogContent>
</ZAlertDialog>
