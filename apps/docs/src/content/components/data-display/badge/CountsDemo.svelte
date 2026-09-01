<script lang="ts">
	import { ZBadge, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack align="center" direction="row" gap="large" wrap>
	<ZText>默认隐藏0 <ZBadge count={0} /></ZText>
	<ZText>显式显示0 <ZBadge count={0} showZero /></ZText>
	<ZText>待处理 <ZBadge count={12} tone="accent" /></ZText>
	<ZText>失败 <ZBadge count={128} max={99} tone="danger" /></ZText>
	<ZText>小尺寸 <ZBadge count={8} size="small" tone="success" /></ZText>
</ZStack>
