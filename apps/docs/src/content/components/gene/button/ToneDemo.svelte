<script lang="ts">
	import { ZButton, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton tone="danger" variant="primary">删除环境</ZButton>
		<ZButton tone="danger" variant="secondary">移除成员</ZButton>
		<ZButton tone="danger" variant="ghost">清空筛选</ZButton>
	</ZStack>
	<ZText tone="muted">
		variant只表达强调层级，tone只表达危险语义；不再使用混合职责的variant="danger"。
	</ZText>
</ZStack>
