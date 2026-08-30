<script lang="ts">
	import { ZBadge, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack align="center" direction="row" gap="large" wrap>
	<ZText>待处理 <ZBadge tone="accent">12</ZBadge></ZText>
	<ZText>失败 <ZBadge tone="danger">3</ZBadge></ZText>
	<ZText>已完成 <ZBadge tone="success">128</ZBadge></ZText>
</ZStack>
