<script lang="ts">
	import {
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
	let failures = $state(0);
</script>

<ZPopconfirm
	formatConfirmError={() => '删除服务暂时不可用，请稍后重试。'}
	onConfirm={async () => {
		await Promise.resolve();
		throw new Error('internal transport detail');
	}}
	onConfirmError={() => (failures += 1)}
>
	<ZPopconfirmTrigger variant="danger">模拟失败</ZPopconfirmTrigger>
	<ZPopconfirmContent>
		<ZPopconfirmTitle>删除生产密钥？</ZPopconfirmTitle>
		<ZPopconfirmDescription>内部异常不会直接泄漏给用户。</ZPopconfirmDescription>
		<ZStack direction="row" gap="medium">
			<ZPopconfirmCancel>取消</ZPopconfirmCancel>
			<ZPopconfirmAction>确认</ZPopconfirmAction>
		</ZStack>
	</ZPopconfirmContent>
</ZPopconfirm>
<ZText tone="muted">当前generation失败次数 = {failures}</ZText>
