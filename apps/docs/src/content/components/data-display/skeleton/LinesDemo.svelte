<script lang="ts">
	import { ZSkeleton, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZSkeleton lines={3} width="24rem" />
	<ZText tone="muted">lines只复制等尺寸文本行；不同宽度、头像、媒体和操作仍由ZStack组合。</ZText>
</ZStack>
