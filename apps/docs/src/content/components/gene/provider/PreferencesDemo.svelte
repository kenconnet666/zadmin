<script lang="ts">
	import { ZButton, ZProvider, ZStack, ZText } from '@zadmin/zui';
</script>

<ZProvider contrast="high" density="compact" direction="rtl" locale="ar" motion="reduced">
	<ZStack gap="medium">
		<ZText weight="semibold">嵌套高对比、紧凑、RTL、减少动画Provider</ZText>
		<ZStack direction="row" gap="small"
			><ZButton>主要操作</ZButton><ZButton variant="secondary">次要操作</ZButton></ZStack
		>
	</ZStack>
</ZProvider>
