<script lang="ts">
	import { ZAspectRatio, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZAspectRatio data-ratio-owner="custom" ratio="21 / 9">
		<ZStack align="center" justify="center"><ZText>响应式自定义内容</ZText></ZStack>
	</ZAspectRatio>
	<ZAspectRatio aria-label="尚无媒体内容" ratio={1.5} />
	<ZText tone="muted">容器宽度始终受父级约束；空内容仍保留确定比例，不创建ResizeObserver。</ZText>
</ZStack>
