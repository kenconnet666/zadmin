<script lang="ts">
	import {
		ZButton,
		ZPopconfirm,
		ZPopconfirmAction,
		ZPopconfirmCancel,
		ZPopconfirmContent,
		ZPopconfirmDescription,
		ZPopconfirmTitle,
		ZPopconfirmTrigger,
		ZProvider,
		ZStack,
		ZText
	} from '@zadmin/zui';
	let completeRequest = $state<(() => void) | undefined>();
	let phase = $state('idle');

	function confirm(): Promise<void> {
		phase = 'pending';
		return new Promise<void>((resolve) => {
			completeRequest = () => {
				phase = 'resolved';
				completeRequest = undefined;
				resolve();
			};
		});
	}
</script>

<ZProvider motion="reduced">
	<ZStack gap="medium">
		<ZPopconfirm onConfirm={confirm} placement="bottom-start">
			<ZPopconfirmTrigger tone="danger">异步删除</ZPopconfirmTrigger>
			<ZPopconfirmContent>
				<ZPopconfirmTitle>提交删除请求？</ZPopconfirmTitle>
				<ZPopconfirmDescription>pending期间确认按钮防重复，取消仍可用。</ZPopconfirmDescription>
				<ZStack direction="row" gap="medium">
					<ZPopconfirmCancel>取消</ZPopconfirmCancel>
					<ZPopconfirmAction>确认删除</ZPopconfirmAction>
				</ZStack>
			</ZPopconfirmContent>
		</ZPopconfirm>
		<ZButton
			disabled={!completeRequest}
			size="small"
			variant="secondary"
			onclick={() => completeRequest?.()}
		>
			模拟服务端完成
		</ZButton>
		<ZText tone="muted">phase = {phase}</ZText>
	</ZStack>
</ZProvider>
