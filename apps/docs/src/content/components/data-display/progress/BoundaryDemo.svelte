<script lang="ts">
	import { ZProgress, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZProgress
		data-range="custom"
		formatValue={(value, range) => `${value - range.min} / ${range.max - range.min} 个分片`}
		label="迁移分片"
		max={20}
		min={10}
		value={17}
	/>
	<ZProgress label="下界夹紧" max={20} min={10} value={-100} />
	<ZProgress label="上界夹紧" max={20} min={10} value={100} view="circle" />
	<ZText tone="muted">
		Progress允许业务值越界并夹紧到范围；非有限值或max不大于min会立即失败。原生line把自定义min平移到浏览器要求的0起点。
	</ZText>
</ZStack>
