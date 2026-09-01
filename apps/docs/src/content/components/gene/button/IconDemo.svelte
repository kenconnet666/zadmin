<script lang="ts">
	import { ZButton, ZIcon, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="small">
	<ZStack direction="row" gap="small" wrap>
		<ZButton aria-label="搜索" title="搜索">
			<ZIcon name="search" />
		</ZButton>
		<ZButton aria-label="关闭" title="关闭" variant="secondary">
			<ZIcon name="close" />
		</ZButton>
		<ZButton aria-label="删除" title="删除" variant="danger">
			<ZIcon name="warning" />
		</ZButton>
	</ZStack>
	<ZText tone="muted">只有图标的按钮必须提供aria-label；title只提供视觉提示，不能替代名称。</ZText>
</ZStack>
