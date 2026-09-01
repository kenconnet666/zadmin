<script lang="ts">
	import Inbox from '@lucide/svelte/icons/inbox';
	import { ZBadge, ZButton, ZProvider, ZStack, ZText } from '@zadmin/zui';

	let count = $state(98);
	let invisible = $state(false);
</script>

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="xlarge" wrap>
		<ZStack align="center" gap="small">
			<ZBadge {count} {invisible} max={99} tone="danger">
				<ZButton aria-label={`完整动画任务箱有${count}项`} shape="square" variant="secondary">
					<Inbox aria-hidden="true" size={18} />
				</ZButton>
			</ZBadge>
			<ZText size="small">完整动画</ZText>
		</ZStack>
		<ZProvider motion="reduced">
			<ZStack align="center" gap="small">
				<ZBadge {count} {invisible} max={99} tone="accent">
					<ZButton aria-label={`减少动画任务箱有${count}项`} shape="square" variant="secondary">
						<Inbox aria-hidden="true" size={18} />
					</ZButton>
				</ZBadge>
				<ZText size="small">减少动画</ZText>
			</ZStack>
		</ZProvider>
	</ZStack>
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="secondary" onclick={() => (count = Math.max(0, count - 1))}
			>减少</ZButton
		>
		<ZButton size="small" onclick={() => (count += 1)}>增加</ZButton>
		<ZButton size="small" variant="secondary" onclick={() => (invisible = !invisible)}>
			{invisible ? '显示' : '隐藏'}指示器
		</ZButton>
	</ZStack>
	<ZText aria-live="polite" tone="muted">
		完整计数 = {count}；视觉显示 = {count > 99 ? '99+' : count}
	</ZText>
</ZStack>
