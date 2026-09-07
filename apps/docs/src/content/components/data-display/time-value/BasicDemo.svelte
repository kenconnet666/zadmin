<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZGroup, ZStack, ZText, ZTimeValue } from '@zadmin/zui';

	const release = new Time(18, 45, 34, 125);
</script>

<ZStack gap="medium">
	<ZGroup gap="large" wrap>
		<ZText
			>24小时：
			<ZTimeValue value={release} hourCycle={24} />
		</ZText>
		<ZText
			>12小时：
			<ZTimeValue value={release} hourCycle={12} />
		</ZText>
		<ZText
			>包含秒：
			<ZTimeValue value={release} hourCycle={24} granularity="second" />
		</ZText>
	</ZGroup>
	<ZTimeValue
		value={release}
		granularity="second"
		size="xxlarge"
		tone="primary"
		weight="semibold"
	/>
	<ZText tone="muted"
		>可见文本由locale、hourCycle与granularity决定；time元素的datetime始终保留完整Time精度。
	</ZText>
</ZStack>
