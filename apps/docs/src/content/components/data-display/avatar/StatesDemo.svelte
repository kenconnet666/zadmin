<script lang="ts">
	import { ZAvatar, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="large" wrap>
		<ZAvatar alt="小尺寸圆形头像" fallbackText="小" size="small" />
		<ZAvatar alt="中尺寸圆角头像" fallbackText="中" shape="rounded" />
		<ZAvatar alt="大尺寸方形头像" fallbackText="大" shape="square" size="large" />
	</ZStack>
	<ZText tone="muted">三种尺寸与形状始终保留稳定占位和可访问名称。</ZText>
</ZStack>
