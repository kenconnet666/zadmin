<script lang="ts">
	import { ZGroup, ZSpacer, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZGroup align="center" gap="none">
		<ZText>开始</ZText><ZSpacer inlineSize="large" /><ZText>相隔一个large内联尺寸</ZText>
	</ZGroup>
	<ZStack gap="none">
		<ZText>上方内容</ZText><ZSpacer blockSize="xlarge" inlineSize="none" /><ZText>下方内容</ZText>
	</ZStack>
</ZStack>
