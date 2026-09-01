<script lang="ts">
	import { ZMeter, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZMeter
		formatValue={(value, range, state) =>
			`${value} GiB / ${range.max} GiB，${state === 'optimal' ? '健康' : state === 'suboptimal' ? '警戒' : '临界'}`}
		high={96}
		label="存储容量"
		low={64}
		max={128}
		optimum={32}
		value={88}
	/>
	<ZText tone="muted">formatter同时成为fallback文本与aria-valuetext，不改变原生阈值。</ZText>
</ZStack>
