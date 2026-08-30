<script lang="ts">
	import { ZSlider, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<label
		><ZText>小尺寸延迟上限</ZText><ZSlider
			defaultValue={250}
			formatValue={(value) => `${value}ms`}
			max={1000}
			min={50}
			size="small"
			step={50}
		/></label
	>
	<label
		><ZText>大尺寸副本数</ZText><ZSlider defaultValue={4} max={10} min={1} size="large" /></label
	>
	<label><ZText>无效阈值</ZText><ZSlider defaultValue={90} invalid /></label>
	<label><ZText>锁定阈值</ZText><ZSlider defaultValue={60} disabled /></label>
</ZStack>
