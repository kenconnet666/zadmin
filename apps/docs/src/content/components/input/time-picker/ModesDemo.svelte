<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZField, ZStack, ZText, ZTimePicker } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	let hourValue = $state<Time | null>(new Time(9, 37, 12, 25));
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`time-picker ${size}`} {size}>
			<ZTimePicker defaultValue={new Time(9, 30)} hourCycle={24} {size} />
		</ZField>
	{/each}
	<ZField label="仅编辑小时" description="已有Time的分钟、秒和毫秒继续保留。">
		<ZTimePicker bind:value={hourValue} granularity="hour" pickerLabel="选择小时" />
	</ZField>
	<ZText tone="muted">小时粒度实际值：{hourValue?.toString() ?? 'null'}</ZText>
	<ZField
		description="xlarge 同时展示 12 小时制和秒列；秒值保留在 Time owner 中。"
		label="12 小时制与秒"
	>
		<ZTimePicker
			defaultValue={new Time(14, 30, 20)}
			granularity="second"
			hourCycle={12}
			secondStep={10}
			size="xlarge"
		/>
	</ZField>
	<ZField label="只读">
		<ZTimePicker defaultValue={new Time(9, 0)} readonly />
	</ZField>
	<ZField label="禁用">
		<ZTimePicker defaultValue={new Time(9, 0)} disabled />
	</ZField>
	<ZText tone="muted">尺寸、hourCycle、granularity、step、readonly 与 disabled 可以分别组合。</ZText
	>
</ZStack>
