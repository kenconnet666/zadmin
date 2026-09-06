<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZField, ZStack, ZText, ZTimePicker } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZField
		description="空值仍可打开；面板只提供 10:30 和 10:45 两个合法分钟。"
		label="限定 10:30–10:45"
	>
		<ZTimePicker
			granularity="minute"
			maxValue={new Time(10, 45)}
			minValue={new Time(10, 30)}
			minuteStep={15}
			pickerLabel="选择限定时间"
		/>
	</ZField>
	<ZField description="没有任何完整合法组合时，Popover 显示不可用状态。" label="全部不可用">
		<ZTimePicker isTimeUnavailable={() => true} pickerLabel="选择可用时间" />
	</ZField>
	<ZField description="午休时段由同一个谓词同时约束字段和面板列。" label="谓词排除午休">
		<ZTimePicker
			defaultValue={new Time(9, 0)}
			isTimeUnavailable={(value) => value.hour >= 12 && value.hour < 14}
			maxValue={new Time(18, 0)}
			minValue={new Time(9, 0)}
			minuteStep={30}
			pickerLabel="选择工作时间"
		/>
	</ZField>
	<ZText tone="muted">min/max、step 与 isTimeUnavailable 共同决定可提交的完整 Time。</ZText>
</ZStack>
