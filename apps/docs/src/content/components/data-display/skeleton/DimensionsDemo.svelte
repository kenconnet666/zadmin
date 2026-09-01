<script lang="ts">
	import { ZSkeleton, ZStack } from '@zadmin/zui';
</script>

<ZStack align="center" direction="row" gap="large" wrap>
	<ZSkeleton height={48} shape="circle" width={48} />
	<ZSkeleton height="4rem" shape="rectangle" width="min(100%, 18rem)" />
	<ZSkeleton height="1.25em" width="12ch" />
</ZStack>
