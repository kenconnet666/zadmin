<script lang="ts">
	import { ZAlert, ZStack, ZText, ZVisuallyHidden } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZAlert live="off" title="单一职责" tone="info">
		ZVisuallyHidden只隐藏非交互说明；可聚焦skip link必须使用真实ZLink及自己的focus样式。
	</ZAlert>
	<ZText>
		发布状态<ZVisuallyHidden data-purpose="print-and-forced-colors"
			>：已通过全部门禁</ZVisuallyHidden
		>
	</ZText>
	<ZText tone="muted">裁切方案不依赖颜色或透明度，在高对比与打印布局中仍不占视觉空间。</ZText>
</ZStack>
