<script lang="ts">
	import { ZLoadingBar, ZProvider, ZStack, ZText } from '@zadmin/zui';
</script>

<ZProvider direction="rtl" motion="reduced">
	<ZStack gap="medium">
		<ZLoadingBar label="RTL减少动画任务" />
		<ZLoadingBar label="RTL确定任务" value={72} />
		<ZText tone="muted">
			RTL使用逻辑起点；reduced motion把不确定指示条保持为静态完整轨道，而不是隐藏进度。
		</ZText>
	</ZStack>
</ZProvider>
