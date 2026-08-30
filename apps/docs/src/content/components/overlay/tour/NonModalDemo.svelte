<script lang="ts">
	import { ZButton, ZStack, ZText, ZTour, type TourStep } from '@zadmin/zui';
	const steps: readonly TourStep[] = [
		{
			id: 'filter',
			target: '#docs-tour-filter',
			title: '筛选器',
			description: '非模态导览允许继续操作页面。',
			placement: 'bottom'
		},
		{
			id: 'export',
			target: '#docs-tour-export',
			title: '导出',
			description: '完成时触发一次onComplete。',
			placement: 'bottom'
		}
	];
	let open = $state(false);
	let completed = $state(0);
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="medium" wrap>
		<ZButton onclick={() => (open = true)}>开始非模态导览</ZButton>
		<ZButton id="docs-tour-filter" variant="secondary">筛选</ZButton>
		<ZButton id="docs-tour-export" variant="secondary">导出</ZButton>
	</ZStack>
	<ZText tone="muted">completed = {completed}</ZText>
</ZStack>
<ZTour
	bind:open
	closeOnMaskClick={false}
	modal={false}
	onComplete={() => (completed += 1)}
	{steps}
/>
