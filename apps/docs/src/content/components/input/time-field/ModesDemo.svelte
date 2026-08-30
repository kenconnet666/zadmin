<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZStack, ZTimeField } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZTimeField defaultValue={new Time(14, 30)} hourCycle={12} minuteStep={15} />
	<ZTimeField
		defaultValue={new Time(14, 30, 20)}
		granularity="second"
		hourCycle={24}
		secondStep={10}
	/>
	<ZTimeField defaultValue={new Time(9, 0)} readonly />
	<ZTimeField defaultValue={new Time(9, 0)} disabled />
</ZStack>
