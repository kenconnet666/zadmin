<script lang="ts">
	import { ZButton, ZLoadingBar, ZStack, ZText } from '@zadmin/zui';
	let value = $state(42);
</script>

<ZStack gap="large">
	<ZLoadingBar label="发布进度" {value} />
	<ZStack direction="row" gap="medium" align="center">
		<ZButton size="small" onclick={() => (value = Math.min(100, value + 10))}>增加10%</ZButton>
		<ZText>value = {value}%</ZText>
	</ZStack>
	<ZLoadingBar label="正在连接构建服务" />
</ZStack>
