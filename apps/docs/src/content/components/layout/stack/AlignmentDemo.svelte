<script lang="ts">
	import { ZBadge, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZStack align="center" direction="row" gap="medium" justify="between">
		<ZText weight="semibold">两端对齐</ZText><ZBadge tone="success">在线</ZBadge>
	</ZStack>
	<ZStack align="end" direction="column" gap={12}>
		<ZText>数字gap = 12px</ZText><ZText tone="muted">逻辑方向对齐适配RTL</ZText>
	</ZStack>
</ZStack>
