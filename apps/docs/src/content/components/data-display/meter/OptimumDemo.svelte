<script lang="ts">
	import { ZMeter, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZMeter high={80} label="越高越好" low={40} optimum={100} value={92} />
	<ZMeter high={80} label="越低越好" low={40} optimum={0} value={12} />
	<ZMeter high={80} label="中间最佳" low={40} optimum={60} value={62} />
	<ZText tone="muted"
		>optimum位于low以下、high以上或阈值之间时，浏览器和data-state使用对应最佳区间。</ZText
	>
</ZStack>
