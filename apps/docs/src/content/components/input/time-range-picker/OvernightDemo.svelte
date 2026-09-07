<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZTimeRangePicker, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZTimeRangePicker
		aria-label="跨午夜值班"
		rangeMode="overnight"
		defaultValue={{ start: new Time(23), end: new Time(1) }}
		hourCycle={24}
	/>
	<ZTimeRangePicker
		aria-label="仅已知开始时间"
		allowEmpty
		defaultValue={{ start: new Time(9), end: null }}
		hourCycle={24}
	/>
	<ZTimeRangePicker
		aria-label="只读时间范围"
		readonly
		defaultValue={{ start: new Time(9), end: new Time(17) }}
		hourCycle={24}
	/>
	<ZTimeRangePicker
		aria-label="禁用时间范围"
		disabled
		defaultValue={{ start: new Time(9), end: new Time(17) }}
		hourCycle={24}
	/>
	<ZText tone="muted"
		>ordered 模式要求结束不早于开始；overnight 明确允许跨午夜并保留 23:00 → 01:00。allowEmpty
		决定是否接受单端点范围。</ZText
	>
</ZStack>
