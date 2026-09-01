<script lang="ts">
	import { ZProvider, ZSpinner, ZStack, ZText } from '@zadmin/zui';
</script>

<ZProvider motion="reduced">
	<ZStack align="center" direction="row" gap="medium">
		<ZSpinner label="减少动画下仍在处理" size="large" />
		<ZText>指示器保持可见，但owner Window中的WAAPI旋转会取消。</ZText>
	</ZStack>
</ZProvider>
