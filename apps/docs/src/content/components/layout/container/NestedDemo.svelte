<script lang="ts">
	import { ZContainer, ZStack, ZText } from '@zadmin/zui';
</script>

<ZContainer data-container-level="outer" gutter="large" size="large">
	<ZStack gap="medium">
		<ZText>外层large容器</ZText>
		<ZContainer data-container-level="inner" gutter="small" size="small">
			<ZText>嵌套small容器显式拥有自己的窄内容边界和gutter。</ZText>
		</ZContainer>
	</ZStack>
</ZContainer>
