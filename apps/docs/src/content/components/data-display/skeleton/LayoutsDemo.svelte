<script lang="ts">
	import { ZSkeleton, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="large" aria-label="正在加载两种内容布局">
	<ZStack direction="row" gap="medium" align="center">
		<ZSkeleton shape="circle" width={56} />
		<ZStack gap="small"><ZSkeleton width="18rem" /><ZSkeleton width="12rem" /></ZStack>
	</ZStack>
	<ZSkeleton height="10rem" shape="rectangle" />
</ZStack>
