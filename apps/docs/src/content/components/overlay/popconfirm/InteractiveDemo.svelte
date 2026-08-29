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

	let open = $state(false);
	let outcome = $state('尚未执行');
</script>

<ZPopconfirm bind:open placement="bottom-start">
	<ZPopconfirmTrigger data-testid="popconfirm-trigger" variant="danger"
		>删除发布记录</ZPopconfirmTrigger
	>
	<ZPopconfirmContent data-testid="popconfirm-content">
		<ZPopconfirmTitle>删除这条发布记录？</ZPopconfirmTitle>
		<ZPopconfirmDescription>审计事件会保留，但该版本将不能再次部署。</ZPopconfirmDescription>
		<ZStack direction="row" gap="medium">
			<ZPopconfirmCancel data-testid="popconfirm-cancel" onclick={() => (outcome = '已取消')}>
				取消
			</ZPopconfirmCancel>
			<ZPopconfirmAction data-testid="popconfirm-action" onclick={() => (outcome = '已删除')}>
				确认删除
			</ZPopconfirmAction>
		</ZStack>
	</ZPopconfirmContent>
</ZPopconfirm>
<ZText tone="muted">open = {open} · 结果 = {outcome}</ZText>
