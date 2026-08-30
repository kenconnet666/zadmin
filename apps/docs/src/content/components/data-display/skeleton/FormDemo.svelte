<script lang="ts">
	import { ZSkeleton, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium" aria-label="正在加载发布摘要">
	<ZText tone="muted">正在加载发布摘要</ZText>
	<ZStack direction="row" gap="medium" align="center">
		<ZSkeleton shape="circle" width={40} />
		<ZStack gap="small">
			<ZSkeleton width="14rem" />
			<ZSkeleton width="9rem" />
		</ZStack>
	</ZStack>
	<ZSkeleton shape="rectangle" height={72} />
</ZStack>
