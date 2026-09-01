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
		ZStack,
		ZText
	} from '@zadmin/zui';
	let finishOldRequest = $state<(() => void) | undefined>();
	let open = $state(false);
	let settled = $state(0);

	function confirm(): Promise<void> {
		return new Promise<void>((resolve) => {
			finishOldRequest = () => {
				settled += 1;
				finishOldRequest = undefined;
				resolve();
			};
		});
	}
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="medium" wrap>
		<ZButton size="small" variant="secondary" onclick={() => (open = true)}>外部打开</ZButton>
		<ZButton size="small" variant="secondary" onclick={() => (open = false)}>外部关闭</ZButton>
		<ZButton
			disabled={!finishOldRequest}
			size="small"
			variant="secondary"
			onclick={() => finishOldRequest?.()}
		>
			完成旧请求
		</ZButton>
	</ZStack>
	<ZPopconfirm bind:open onConfirm={confirm}>
		<ZPopconfirmTrigger variant="danger">受控确认</ZPopconfirmTrigger>
		<ZPopconfirmContent>
			<ZPopconfirmTitle>执行长任务？</ZPopconfirmTitle>
			<ZPopconfirmDescription
				>关闭会使当前generation失效，迟到resolve不能关闭后续实例。</ZPopconfirmDescription
			>
			<ZStack direction="row" gap="medium">
				<ZPopconfirmCancel>取消</ZPopconfirmCancel>
				<ZPopconfirmAction>开始</ZPopconfirmAction>
			</ZStack>
		</ZPopconfirmContent>
	</ZPopconfirm>
	<ZText tone="muted">open = {open} · 已settle旧请求 = {settled}</ZText>
</ZStack>
