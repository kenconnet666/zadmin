<script lang="ts">
	import { ZContainer, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZContainer gutter="large" size="full">
		<ZText>full只移除最大宽度限制，仍保留显式large gutter。</ZText>
	</ZContainer>
	<ZContainer gutter="medium" size="small">
		<ZText>
			窄屏和连续标识container-production-release-with-an-intentionally-long-name由内容自己的换行策略处理；Container只提供box-sizing安全的max-width和逻辑gutter。
		</ZText>
	</ZContainer>
</ZStack>
