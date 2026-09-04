<script lang="ts">
	import { ZButton, ZIcon, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="small">
	<ZStack align="center" direction="row" gap="small" wrap>
		<ZButton aria-label="搜索" shape="square" size="small" title="搜索">
			<ZIcon name="search" />
		</ZButton>
		<ZButton aria-label="关闭" shape="square" size="medium" title="关闭" variant="secondary">
			<ZIcon name="close" />
		</ZButton>
		<ZButton aria-label="删除" shape="circle" size="large" title="删除" tone="danger">
			<ZIcon name="warning" />
		</ZButton>
	</ZStack>
	<ZText tone="muted"
		>square/circle让图标按钮与size保持等宽高；只有图标的按钮必须提供aria-label，title不能替代名称。</ZText
	>
</ZStack>
