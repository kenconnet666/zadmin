<script lang="ts">
	import { ZContainer, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZContainer gutter="small" size="small"><ZText>small容器 + small gutter</ZText></ZContainer>
	<ZContainer gutter="medium" size="medium"><ZText>medium容器 + medium gutter</ZText></ZContainer>
	<ZContainer gutter="large" size="large"><ZText>large容器 + large gutter</ZText></ZContainer>
</ZStack>
