<script lang="ts">
	import { ZMeter, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZMeter label="健康容量" value={24} low={35} high={80} optimum={25} />
	<ZMeter label="警戒容量" value={63} low={35} high={80} optimum={25} />
	<ZMeter label="临界容量" value={92} low={35} high={80} optimum={25} />
</ZStack>
