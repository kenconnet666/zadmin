<script lang="ts">
	import { ZStack, ZTag, ZText } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZStack align="center" direction="row" gap="medium" justify="between">
		<ZText weight="semibold">两端对齐</ZText><ZTag tone="success">在线</ZTag>
	</ZStack>
	<ZStack align="end" direction="column" gap={12}>
		<ZText>数字gap = 12px</ZText><ZText tone="muted">逻辑方向对齐适配RTL</ZText>
	</ZStack>
</ZStack>
