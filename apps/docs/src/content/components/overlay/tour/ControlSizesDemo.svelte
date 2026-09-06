<script lang="ts">
	import { controlSizes, ZButton, ZStack, ZTour, type ZControlSize } from '@zadmin/zui';
	let selectedSize = $state<ZControlSize>('medium');
	let open = $state(false);
	const steps = [
		{
			id: 'welcome',
			title: '欢迎使用部署工作台',
			description: '正文、面板间距与操作按钮随所选尺寸变化；进入和退出使用独立主题缓动。'
		}
	];
</script>

<ZStack direction="row" wrap gap="small">
	{#each controlSizes as size (size)}
		<ZButton
			{size}
			variant="outline"
			onclick={() => {
				selectedSize = size;
				open = true;
			}}>{size}</ZButton
		>
	{/each}
</ZStack>
<ZTour bind:open size={selectedSize} {steps} />
