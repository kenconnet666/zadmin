<script lang="ts">
	import { ZMeter, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="small">
	<ZMeter
		aria-describedby="meter-native-description"
		data-meter-owner="capacity"
		high={85}
		label="并发连接容量"
		low={45}
		max={120}
		optimum={30}
		value={74}
	/>
	<ZText id="meter-native-description" tone="muted">
		真实meter保留aria-describedby、data属性、平台高对比和原生最佳区间绘制。
	</ZText>
</ZStack>
