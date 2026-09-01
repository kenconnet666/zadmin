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
		ZStack,
		ZText
	} from '@zadmin/zui';
	let attempts = $state(0);
</script>

<ZAlertDialog>
	<ZAlertDialogTrigger tone="danger">验证后删除</ZAlertDialogTrigger>
	<ZAlertDialogOverlay />
	<ZAlertDialogContent>
		<ZStack gap="large">
			<ZAlertDialogTitle>确认删除？</ZAlertDialogTitle>
			<ZAlertDialogDescription>第一次确认模拟服务端拒绝，并保持对话框打开。</ZAlertDialogDescription
			>
			<ZText tone="muted">尝试次数 = {attempts}</ZText>
			<ZStack direction="row" gap="medium">
				<ZAlertDialogCancel>取消</ZAlertDialogCancel>
				<ZAlertDialogAction
					onclick={(event) => {
						attempts += 1;
						if (attempts === 1) event.preventDefault();
					}}>确认删除</ZAlertDialogAction
				>
			</ZStack>
		</ZStack>
	</ZAlertDialogContent>
</ZAlertDialog>
