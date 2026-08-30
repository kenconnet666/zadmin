<script lang="ts">
	import { ZProgress, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZProgress
		formatValue={(value, range) => `${value - range.min} / ${range.max - range.min} GB`}
		label="缓存用量"
		max={64}
		min={16}
		value={40}
	/>
	<ZProgress label="等待服务返回" />
</ZStack>
