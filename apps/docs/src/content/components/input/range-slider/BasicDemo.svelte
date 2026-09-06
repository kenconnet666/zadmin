<script lang="ts">
	import { ZField, ZRangeSlider, ZText, type SliderRangeValue } from '@zadmin/zui';

	let value = $state<SliderRangeValue>([20, 80]);
</script>

<ZField label="CPU告警区间" description="两个真实range input分别拥有下界和上界名称。">
	<ZRangeSlider
		bind:value
		thumbLabels={['CPU下界', 'CPU上界']}
		formatValue={(current) => `${current}%`}
		step={5}
	/>
</ZField>
<ZText tone="muted">区间：{value[0]}% – {value[1]}%</ZText>
