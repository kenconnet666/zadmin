<script lang="ts">
	import Inbox from '@lucide/svelte/icons/inbox';
	import {
		ZBadge,
		ZButton,
		ZProvider,
		ZStack,
		ZText,
		type BadgePlacement,
		type BadgeSize,
		type BadgeTone
	} from '@zadmin/zui';

	let count = $state(98);
	let invisible = $state(false);
	let dot = $state(false);
	let size = $state<BadgeSize>('medium');
	let tone = $state<BadgeTone>('danger');
	let placement = $state<BadgePlacement>('top-end');
	const sizes: readonly BadgeSize[] = ['medium', 'small'];
	const tones: readonly BadgeTone[] = ['danger', 'accent', 'success', 'warning', 'default'];
	const placements: readonly BadgePlacement[] = [
		'top-end',
		'top-start',
		'bottom-end',
		'bottom-start'
	];

	function cycle<T>(values: readonly T[], current: T): T {
		return values[(values.indexOf(current) + 1) % values.length]!;
	}
</script>

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="xlarge" wrap>
		<ZStack align="center" gap="small">
			<ZBadge
				{count}
				{dot}
				{invisible}
				{placement}
				{size}
				max={99}
				{tone}
				label={dot ? '有通知' : undefined}
			>
				<ZButton aria-label={`完整动画任务箱有${count}项`} shape="square" variant="secondary">
					<Inbox aria-hidden="true" size={18} />
				</ZButton>
			</ZBadge>
			<ZText size="small">完整动画</ZText>
		</ZStack>
		<ZProvider motion="reduced">
			<ZStack align="center" gap="small">
				<ZBadge
					{count}
					{dot}
					{invisible}
					{placement}
					{size}
					max={99}
					tone="accent"
					label={dot ? '有通知' : undefined}
				>
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
		<ZButton size="small" variant="secondary" onclick={() => (dot = !dot)}>
			{dot ? '计数' : 'Dot'}模式
		</ZButton>
		<ZButton size="small" variant="secondary" onclick={() => (size = cycle(sizes, size))}>
			size（{size}）
		</ZButton>
		<ZButton size="small" variant="secondary" onclick={() => (tone = cycle(tones, tone))}>
			tone（{tone}）
		</ZButton>
		<ZButton
			size="small"
			variant="secondary"
			onclick={() => (placement = cycle(placements, placement))}
		>
			placement（{placement}）
		</ZButton>
	</ZStack>
	<ZText aria-live="polite" tone="muted">
		完整计数 = {count}；视觉显示 = {dot ? 'Dot' : count > 99 ? '99+' : count}；{size} / {tone} / {placement}
	</ZText>
</ZStack>
