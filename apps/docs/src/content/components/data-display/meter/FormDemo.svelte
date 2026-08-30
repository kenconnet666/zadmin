<script lang="ts">
	import { ZMeter, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZMeter label="CPU容量" value={72} low={35} high={80} optimum={25} />
	<ZText tone="muted">72位于次优区间；阈值非法时组件立即拒绝。</ZText>
</ZStack>
