<script lang="ts">
	import { ZButton, ZInput, ZProgress, ZProvider, ZSkeleton, ZStack, ZText } from '@zadmin/zui';

	type MotionPreference = 'auto' | 'full' | 'reduced';

	const choices: readonly { readonly label: string; readonly value: MotionPreference }[] = [
		{ label: '跟随系统', value: 'auto' },
		{ label: '保留动画', value: 'full' },
		{ label: '减少动画', value: 'reduced' }
	];
	let motion = $state<MotionPreference>('auto');
</script>

<ZStack direction="column" gap="large">
	<ZStack gap="small" wrap>
		{#each choices as choice (choice.value)}
			<ZButton
				aria-pressed={motion === choice.value}
				size="small"
				variant={motion === choice.value ? 'primary' : 'secondary'}
				onclick={() => (motion = choice.value)}>{choice.label}</ZButton
			>
		{/each}
	</ZStack>

	<ZProvider {motion}>
		<ZStack direction="column" gap="medium">
			<ZText>
				当前策略：{motion}。auto读取组件ownerDocument的系统偏好；full显式保留；reduced立即停止循环并清除过渡。
			</ZText>
			<ZInput aria-label="Motion输入框" placeholder="聚焦以检查边框过渡" />
			<ZStack align="center" gap="large" wrap>
				<ZProgress label="不确定任务" view="circle" />
				<ZStack direction="column" gap="small">
					<ZSkeleton width="12rem" />
					<ZSkeleton width="8rem" />
				</ZStack>
			</ZStack>
		</ZStack>
	</ZProvider>
</ZStack>
