<script lang="ts">
	import { ZBackTop, ZButton, ZProvider, ZScrollArea, ZStack, ZText } from '@zadmin/zui';
	let owner = $state<HTMLDivElement | null>(null);
	let reduced = $state(false);
</script>

<ZProvider motion={reduced ? 'reduced' : 'full'}>
	<ZStack gap="small">
		<ZButton size="small" variant="outline" onclick={() => (reduced = !reduced)}
			>{reduced ? '恢复完整动画' : '减少动画'}</ZButton
		>
		<ZScrollArea bind:ref={owner} aria-label="BackTop动画示例" height="12rem">
			<div style="min-height:30rem; padding:1rem;">
				<ZText>滚动此区域后，逻辑起始侧按钮会出现。切换动画偏好可观察退出与返回顶部的行为。</ZText>
				<ZBackTop
					label="回到顶部"
					placement="start"
					size="small"
					tone="neutral"
					variant="outline"
					shape="square"
					visibilityHeight={32}
					scrollContainer={owner}
					insetBlockEnd={96}
				/>
			</div>
		</ZScrollArea>
	</ZStack>
</ZProvider>
