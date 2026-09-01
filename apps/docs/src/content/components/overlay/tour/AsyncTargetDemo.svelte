<script lang="ts">
	import { onDestroy } from 'svelte';
	import { ZButton, ZStack, ZText, ZTour, type TourStep } from '@zadmin/zui';

	const steps: readonly TourStep[] = [
		{
			id: 'lazy-target',
			target: '#docs-tour-lazy-target',
			placement: 'bottom',
			title: '等待异步目标',
			description: '目标尚未挂载时保留居中导览卡；DOM出现后自动切换到真实锚点。'
		},
		{
			id: 'ready-target',
			target: '#docs-tour-ready-target',
			placement: 'top',
			title: '继续导览',
			description: '后续步骤继续使用同一个受控step owner。'
		}
	];
	let open = $state(false);
	let showLazyTarget = $state(false);
	let missingCount = $state(0);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function start(): void {
		if (timer !== undefined) clearTimeout(timer);
		showLazyTarget = false;
		missingCount = 0;
		open = true;
		timer = setTimeout(() => {
			showLazyTarget = true;
		}, 800);
	}

	onDestroy(() => {
		if (timer !== undefined) clearTimeout(timer);
	});
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="medium" wrap>
		<ZButton onclick={start}>模拟异步挂载</ZButton>
		{#if showLazyTarget}
			<ZButton id="docs-tour-lazy-target" variant="secondary">异步目标已就绪</ZButton>
		{/if}
		<ZButton id="docs-tour-ready-target" variant="secondary">稳定目标</ZButton>
	</ZStack>
	<ZText tone="muted">onTargetMissing 调用次数：{missingCount}</ZText>
</ZStack>

<ZTour bind:open missingTargetBehavior="wait" onTargetMissing={() => (missingCount += 1)} {steps} />
