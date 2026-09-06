<script lang="ts">
	import { ZRangeSlider, ZStack, ZText, type SliderCollision } from '@zadmin/zui';

	const collisions = ['clamp', 'push', 'swap'] satisfies readonly SliderCollision[];
	const descriptions = {
		clamp: '活动thumb停在最小间距边界',
		push: '活动thumb继续时推动相邻thumb',
		swap: '越过时交换当前活动thumb'
	} satisfies Record<SliderCollision, string>;
</script>

<ZStack gap="large">
	{#each collisions as collision (collision)}
		<div>
			<ZText>{collision}：{descriptions[collision]}</ZText>
			<ZRangeSlider
				{collision}
				defaultValue={[35, 65]}
				minRange={20}
				step={5}
				thumbLabels={[`${collision}下界`, `${collision}上界`]}
			/>
		</div>
	{/each}
</ZStack>
