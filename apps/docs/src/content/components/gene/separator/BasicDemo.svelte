<script lang="ts">
	import { ZSeparator, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZText weight="semibold">水平章节</ZText>
	<ZSeparator />
	<ZStack direction="row" gap="large">
		<ZText>左侧内容</ZText>
		<ZSeparator orientation="vertical" />
		<ZText>右侧内容</ZText>
	</ZStack>
</ZStack>
