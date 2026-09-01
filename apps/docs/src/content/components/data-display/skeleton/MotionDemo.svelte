<script lang="ts">
	import { ZProvider, ZSkeleton, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZSkeleton width="18rem" />
	<ZSkeleton animated={false} width="14rem" />
	<ZProvider motion="reduced">
		<ZSkeleton lines={2} width="20rem" />
	</ZProvider>
	<ZText tone="muted">animated=false和Provider reduced都保持静态；Skeleton仍然aria-hidden。</ZText>
</ZStack>
