<script lang="ts">
	import { ZButton, ZStack, ZTour, type TourStep } from '@zadmin/zui';
	const steps: readonly TourStep[] = [
		{
			id: 'summary',
			target: '#docs-tour-summary',
			placement: 'bottom-start',
			title: '发布摘要',
			description: '先确认版本、区域和负责人。'
		},
		{
			id: 'metrics',
			target: '#docs-tour-metrics',
			placement: 'right',
			title: '生产指标',
			description: '再检查延迟、错误率与资源水位。'
		}
	];
	let open = $state(false);
	let step = $state(0);
</script>

<ZStack direction="row" gap="large">
	<ZButton
		id="docs-tour-start"
		onclick={() => {
			step = 0;
			open = true;
		}}>开始导览</ZButton
	>
	<button id="docs-tour-summary" type="button">发布摘要目标</button>
	<button id="docs-tour-metrics" type="button">生产指标目标</button>
</ZStack>
<ZTour
	{steps}
	bind:open
	bind:step
	previousLabel="上一步"
	nextLabel="下一步"
	finishLabel="完成"
	closeLabel="关闭导览"
/>
