<script lang="ts">
	import { ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="small">
	<ZText as="strong" size="large" tabularNumbers>¥ 18,420.00</ZText>
	<ZText tabularNumbers>请求 001284 · P95 0082 ms · 错误率 0.03%</ZText>
	<ZText tone="muted">
		tabularNumbers只改变数字字形宽度；金额格式、分组与本地化仍由Intl或业务formatter负责。
	</ZText>
</ZStack>
