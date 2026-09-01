<script lang="ts">
	import { ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZText as="p" lineHeight="compact">
		compact适合密集指标或短标签，但不应用于长篇连续阅读内容。
	</ZText>
	<ZText as="p" lineHeight="normal">
		normal是正文默认行高，在后台界面的说明、表单帮助和状态文本之间保持稳定节奏。
	</ZText>
	<ZText as="p" lineHeight="relaxed">
		relaxed适合较长说明文本，增加行间留白，同时不改变段落的真实HTML语义。
	</ZText>
</ZStack>
