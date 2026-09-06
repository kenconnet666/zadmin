<script lang="ts">
	import { ZProvider, ZRangeSlider, ZStack, ZText } from '@zadmin/zui';

	const marks = [
		{ label: '低', value: 0 },
		{ label: '中', value: 50 },
		{ label: '高', value: 100 }
	] as const;
</script>

<ZStack direction="row" gap="xlarge" wrap>
	<div>
		<ZText>垂直且反向</ZText>
		<ZRangeSlider
			defaultValue={[20, 70]}
			orientation="vertical"
			reversed
			tone="warning"
			{marks}
			thumbLabels={['垂直下界', '垂直上界']}
			valueLabel="always"
		/>
	</div>
	<ZProvider direction="rtl">
		<div style="inline-size: min(100%, 20rem);">
			<ZText>RTL水平轨道</ZText>
			<ZRangeSlider defaultValue={[30, 60]} thumbLabels={['RTL下界', 'RTL上界']} {marks} />
		</div>
	</ZProvider>
</ZStack>
